/** Query & aksi untuk halaman admin toko */
import { and, asc, desc, eq, inArray, isNull, sql } from 'drizzle-orm';
import type { OrderStatus, ProductImage, SizeRow } from '$lib/shop/constants';
import type { Conn } from '../db';
import {
	categories,
	orderItems,
	orders,
	partners,
	poBatches,
	products,
	refunds,
	type Order
} from '../db/schema';
import { listAllBatches } from './batches';
import { ShopError } from './orders';

const DAY = 86_400_000;

/** Ringkasan isi pesanan + status kirim untuk sekumpulan pesanan */
function orderExtras(db: Conn, orderIds: number[]) {
	const out = new Map<number, { summary: string; pcs: number; readyToShip: boolean; earliestClose: number }>();
	if (!orderIds.length) return out;
	const rows = db
		.select({
			orderId: orderItems.orderId,
			name: orderItems.productName,
			size: orderItems.size,
			qty: orderItems.qty,
			refundId: orderItems.refundId,
			batchStatus: poBatches.status,
			closesAt: poBatches.closesAt
		})
		.from(orderItems)
		.innerJoin(poBatches, eq(poBatches.id, orderItems.batchId))
		.where(inArray(orderItems.orderId, orderIds))
		.all();
	const grouped = new Map<number, typeof rows>();
	for (const r of rows) grouped.set(r.orderId, [...(grouped.get(r.orderId) ?? []), r]);
	for (const [id, items] of grouped) {
		const active = items.filter((i) => i.refundId === null);
		out.set(id, {
			summary: items.map((i) => `${i.name}${i.size ? ` ${i.size}` : ''} ×${i.qty}`).join(', '),
			pcs: items.reduce((s, i) => s + i.qty, 0),
			readyToShip:
				active.length > 0 && active.every((i) => i.batchStatus === 'production' || i.batchStatus === 'done'),
			earliestClose: Math.min(...items.map((i) => i.closesAt.getTime()))
		});
	}
	return out;
}

export interface AdminOrderRow {
	id: number;
	code: string;
	token: string;
	customerName: string;
	phone: string;
	partnerCode: string;
	city: string;
	total: number;
	uniqueCode: number;
	status: OrderStatus;
	createdAt: number;
	payBy: number;
	proofAt: number | null;
	hasProof: boolean;
	summary: string;
	pcs: number;
	readyToShip: boolean;
	earliestClose: number;
	trackingNo: string | null;
}

function toRow(o: Order, extras: ReturnType<typeof orderExtras>): AdminOrderRow {
	const x = extras.get(o.id);
	return {
		id: o.id,
		code: o.code,
		token: o.token,
		customerName: o.customerName,
		phone: o.phone,
		partnerCode: o.partnerCode,
		city: o.city,
		total: o.total,
		uniqueCode: o.uniqueCode,
		status: o.status,
		createdAt: o.createdAt.getTime(),
		payBy: o.payBy.getTime(),
		proofAt: o.proofAt?.getTime() ?? null,
		hasProof: !!o.proofPath,
		summary: x?.summary ?? '',
		pcs: x?.pcs ?? 0,
		readyToShip: o.status === 'paid' && !!x?.readyToShip,
		earliestClose: x?.earliestClose ?? 0,
		trackingNo: o.trackingNo
	};
}

export function listOrders(db: Conn, opts: { status?: OrderStatus } = {}): AdminOrderRow[] {
	const rows = db
		.select()
		.from(orders)
		.where(opts.status ? eq(orders.status, opts.status) : undefined)
		.orderBy(desc(orders.id))
		.all();
	const extras = orderExtras(
		db,
		rows.map((o) => o.id)
	);
	return rows.map((o) => toRow(o, extras));
}

/** Antrean konfirmasi: yang PO-nya paling cepat tutup di atas */
export function listPendingConfirmations(db: Conn): AdminOrderRow[] {
	return listOrders(db, { status: 'pending_confirmation' }).sort((a, b) => a.earliestClose - b.earliestClose || a.id - b.id);
}

export function getProofPath(db: Conn, orderId: number) {
	return db.select({ proofPath: orders.proofPath }).from(orders).where(eq(orders.id, orderId)).get()?.proofPath ?? null;
}

export function listRefunds(db: Conn) {
	return db
		.select({
			id: refunds.id,
			orderId: refunds.orderId,
			amount: refunds.amount,
			reason: refunds.reason,
			status: refunds.status,
			destination: refunds.destination,
			note: refunds.note,
			createdAt: refunds.createdAt,
			doneAt: refunds.doneAt,
			code: orders.code,
			token: orders.token,
			customerName: orders.customerName,
			phone: orders.phone,
			total: orders.total,
			hasProof: sql<number>`${orders.proofPath} is not null`
		})
		.from(refunds)
		.innerJoin(orders, eq(orders.id, refunds.orderId))
		.orderBy(asc(refunds.status), desc(refunds.id))
		.all()
		.map((r) => ({
			...r,
			hasProof: !!r.hasProof,
			createdAt: r.createdAt.getTime(),
			doneAt: r.doneAt?.getTime() ?? null
		}));
}

export function dashboardStats(db: Conn, now: number) {
	const count = (status: OrderStatus) =>
		db.select({ n: sql<number>`count(*)` }).from(orders).where(eq(orders.status, status)).get()!.n;
	const refundRow = db
		.select({ n: sql<number>`count(*)`, sum: sql<number>`coalesce(sum(${refunds.amount}), 0)` })
		.from(refunds)
		.where(eq(refunds.status, 'pending'))
		.get()!;
	const paid = listOrders(db, { status: 'paid' });
	const batches = listAllBatches(db);
	const pendingRows = listPendingConfirmations(db);
	return {
		pendingConfirmation: pendingRows.length,
		pendingPayment: count('pending_payment'),
		readyToShip: paid.filter((o) => o.readyToShip).length,
		refundsPending: refundRow.n,
		refundsPendingAmount: refundRow.sum,
		openBatches: batches.filter((b) => b.status === 'open').length,
		/** PO yang tutup dalam 24 jam dan masih punya pembayaran belum dikonfirmasi */
		urgent: pendingRows.filter((o) => o.earliestClose - now < DAY && o.earliestClose > now).length,
		batches
	};
}

// ── Produk ──

export function listProductsAdmin(db: Conn) {
	const rows = db
		.select({ p: products, categoryName: categories.name })
		.from(products)
		.innerJoin(categories, eq(categories.id, products.categoryId))
		.orderBy(asc(products.sort), asc(products.id))
		.all();
	const batches = listAllBatches(db);
	return rows.map(({ p, categoryName }) => {
		const own = batches.filter((b) => b.productId === p.id).sort((a, b) => b.batchNo - a.batchNo);
		return {
			id: p.id,
			slug: p.slug,
			name: p.name,
			price: p.price,
			active: p.active,
			featured: p.featured,
			image: p.images[0] ?? null,
			categoryName,
			batch: own[0] ?? null
		};
	});
}

export function getProductAdmin(db: Conn, id: number) {
	return db.select().from(products).where(eq(products.id, id)).get() ?? null;
}

export interface ProductInput {
	name: string;
	slug: string;
	categoryId: number;
	summary: string;
	description: string;
	details: string;
	price: number;
	sizes: string;
	sizeChart: string;
	productionDays: number;
	active: boolean;
	featured: boolean;
	sort: number;
}

/** "S, M, L" → ["S","M","L"] (tanpa duplikat) */
export function parseSizes(input: string): string[] {
	return [...new Set(input.split(/[,\n]/).map((s) => s.trim().toUpperCase()).filter(Boolean))];
}

/** Baris "M 69 52" → { size: "M", length: 69, width: 52 } */
export function parseSizeChart(input: string): SizeRow[] {
	return input
		.split('\n')
		.map((l) => l.trim())
		.filter(Boolean)
		.map((l) => {
			const [size, length, width] = l.split(/[\s,;]+/);
			const num = (v?: string) => (v && /^\d+(\.\d+)?$/.test(v) ? Number(v) : null);
			return { size: (size ?? '').toUpperCase(), length: num(length), width: num(width) };
		})
		.filter((r) => r.size);
}

export const sizeChartToText = (rows: SizeRow[]) =>
	rows.map((r) => [r.size, r.length ?? '', r.width ?? ''].join(' ').trim()).join('\n');

export function saveProduct(db: Conn, id: number | null, input: ProductInput, now: Date) {
	const clash = db.select({ id: products.id }).from(products).where(eq(products.slug, input.slug)).get();
	if (clash && clash.id !== id) throw new ShopError('Slug sudah dipakai produk lain.', 'slug');
	const values = {
		name: input.name,
		slug: input.slug,
		categoryId: input.categoryId,
		summary: input.summary,
		description: input.description,
		details: input.details,
		price: input.price,
		sizes: parseSizes(input.sizes),
		sizeChart: parseSizeChart(input.sizeChart),
		productionDays: input.productionDays,
		active: input.active,
		featured: input.featured,
		sort: input.sort,
		updatedAt: now
	};
	if (id === null) {
		return db
			.insert(products)
			.values({ ...values, createdAt: now })
			.returning({ id: products.id })
			.get().id;
	}
	db.update(products).set(values).where(eq(products.id, id)).run();
	return id;
}

export function setProductImages(db: Conn, id: number, images: ProductImage[], now: Date) {
	db.update(products).set({ images, updatedAt: now }).where(eq(products.id, id)).run();
}

export function listCategoriesAdmin(db: Conn) {
	return db.select().from(categories).orderBy(asc(categories.sort), asc(categories.id)).all();
}

// ── Mitra ──

export function listPartners(db: Conn) {
	const counts = new Map(
		db
			.select({ partnerId: orders.partnerId, n: sql<number>`count(*)` })
			.from(orders)
			.where(inArray(orders.status, ['paid', 'shipped']))
			.groupBy(orders.partnerId)
			.all()
			.map((r) => [r.partnerId, r.n])
	);
	return db
		.select()
		.from(partners)
		.orderBy(desc(partners.active), asc(partners.code))
		.all()
		.map((p) => ({ ...p, createdAt: p.createdAt.getTime(), updatedAt: p.updatedAt.getTime(), orders: counts.get(p.id) ?? 0 }));
}

export function savePartner(
	db: Conn,
	input: { id: number; code: string; name: string; phone: string; city: string; active: boolean },
	now: Date
) {
	const clash = db.select({ id: partners.id }).from(partners).where(eq(partners.code, input.code)).get();
	if (clash && clash.id !== input.id) throw new ShopError('Kode mitra sudah dipakai.', 'code');
	const values = { code: input.code, name: input.name, phone: input.phone, city: input.city, active: input.active, updatedAt: now };
	if (input.id) db.update(partners).set(values).where(eq(partners.id, input.id)).run();
	else db.insert(partners).values({ ...values, createdAt: now }).run();
}

/** Baca CSV sederhana (koma atau titik koma, tanda kutip ganda didukung) */
export function parseCsv(text: string): string[][] {
	const rows: string[][] = [];
	const sep = (text.split('\n')[0].match(/;/g)?.length ?? 0) > (text.split('\n')[0].match(/,/g)?.length ?? 0) ? ';' : ',';
	let row: string[] = [];
	let cell = '';
	let quoted = false;
	for (let i = 0; i < text.length; i++) {
		const ch = text[i];
		if (quoted) {
			if (ch === '"' && text[i + 1] === '"') {
				cell += '"';
				i++;
			} else if (ch === '"') quoted = false;
			else cell += ch;
		} else if (ch === '"') quoted = true;
		else if (ch === sep) {
			row.push(cell.trim());
			cell = '';
		} else if (ch === '\n' || ch === '\r') {
			if (ch === '\r' && text[i + 1] === '\n') i++;
			row.push(cell.trim());
			if (row.some(Boolean)) rows.push(row);
			row = [];
			cell = '';
		} else cell += ch;
	}
	row.push(cell.trim());
	if (row.some(Boolean)) rows.push(row);
	return rows;
}

export function csvEscape(v: unknown) {
	const s = String(v ?? '');
	return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Pesanan lunas yang masih menunggu PO lain (untuk info di detail produk) */
export function activeItemsForBatch(db: Conn, batchId: number) {
	return db
		.select({ n: sql<number>`count(*)` })
		.from(orderItems)
		.where(and(eq(orderItems.batchId, batchId), isNull(orderItems.refundId)))
		.get()!.n;
}

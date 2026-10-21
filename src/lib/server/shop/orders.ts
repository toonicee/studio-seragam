/** Pesanan: checkout, bukti bayar, konfirmasi admin, pembatalan, pengiriman, refund */
import { randomBytes, randomInt } from 'node:crypto';
import { and, asc, eq, inArray, isNull, ne } from 'drizzle-orm';
import { cartProblemText, translate, type Lang, type TKey } from '$lib/shop/i18n';
import { wibDateString } from '$lib/shop/po';
import type { OrderView } from '$lib/shop/types';
import type { Conn } from '../db';
import {
	orderItems,
	orders,
	partners,
	poBatches,
	products,
	refunds,
	shippingZones,
	type Order
} from '../db/schema';
import { resolveCart, type CartLine } from './cart';
import { collectedByBatch, toBatchView } from './catalog';
import { getSettings } from './settings';

type Vars = Record<string, string | number>;

/** Kesalahan yang aman ditampilkan ke pembeli/admin. `key` = teks kamus agar bisa diterjemahkan untuk pembeli */
export class ShopError extends Error {
	constructor(
		message: string,
		public field?: string,
		public key?: TKey,
		public vars?: Vars
	) {
		super(message);
		this.name = 'ShopError';
	}
}

function textFor(lang: Lang, key: TKey, vars?: Vars) {
	if (key === 'err.item' && vars)
		return translate(lang, key, {
			name: vars.name,
			problem: cartProblemText(lang, String(vars.problem), Number(vars.closesAt) || null)
		});
	return translate(lang, key, vars);
}

/** Kesalahan dari kamus; pesan bawaannya Bahasa Indonesia */
export const shopError = (key: TKey, vars?: Vars, field?: string) =>
	new ShopError(textFor('id', key, vars), field, key, vars);

/** Pesan kesalahan untuk pembeli dalam bahasanya */
export const localizeError = (e: ShopError, lang: Lang) => (e.key ? textFor(lang, e.key, e.vars) : e.message);

const HOUR = 3600_000;
/** Pesanan yang nominalnya masih harus dicocokkan admin */
const AWAITING = ['pending_payment', 'pending_confirmation'] as const;

export function findPartner(db: Conn, code: string, phone: string) {
	const p = db.select().from(partners).where(eq(partners.code, code.trim().toUpperCase())).get();
	if (!p || !p.active || p.phone !== phone) return null;
	return p;
}

/** Kode unik 1–999 supaya total tidak sama dengan pesanan lain yang menunggu bayar/konfirmasi */
export function pickUniqueCode(
	base: number,
	takenTotals: Set<number>,
	rand: () => number = () => randomInt(1, 1000)
): number {
	for (let i = 0; i < 40; i++) {
		const c = rand();
		if (c >= 1 && c <= 999 && !takenTotals.has(base + c)) return c;
	}
	for (let c = 1; c <= 999; c++) if (!takenTotals.has(base + c)) return c;
	throw shopError('err.busy');
}

/** "IE-261021-0007" — tanggal WIB + nomor urut */
export function orderCode(id: number, at: Date) {
	return `IE-${wibDateString(at.getTime()).slice(2).replaceAll('-', '')}-${String(id).padStart(4, '0')}`;
}

export interface NewOrder {
	partnerCode: string;
	/** Sudah dinormalkan ke 62… */
	phone: string;
	name: string;
	email: string;
	address: string;
	city: string;
	postalCode: string;
	zoneId: number;
	note: string;
}

export function createOrder(
	db: Conn,
	input: NewOrder,
	lines: CartLine[],
	now: Date,
	opts: { rand?: () => number; lang?: Lang } = {}
): { id: number; code: string; token: string } {
	return db.transaction((tx) => {
		const partner = findPartner(tx, input.partnerCode, input.phone);
		if (!partner) throw shopError('err.partner', undefined, 'partnerCode');

		const zone = tx.select().from(shippingZones).where(eq(shippingZones.id, input.zoneId)).get();
		if (!zone || !zone.active) throw shopError('err.zone', undefined, 'zoneId');

		const cart = resolveCart(tx, lines, now.getTime(), opts.lang);
		if (!cart.lines.length) throw shopError('err.cartEmpty');
		const bad = cart.lines.find((l) => !l.orderable);
		if (bad)
			throw shopError('err.item', { name: bad.name, problem: bad.problem ?? '', closesAt: bad.batch?.closesAt ?? 0 });

		const base = cart.subtotal + zone.fee;
		const taken = new Set(
			tx
				.select({ total: orders.total })
				.from(orders)
				.where(inArray(orders.status, [...AWAITING]))
				.all()
				.map((r) => r.total)
		);
		const uniqueCode = pickUniqueCode(base, taken, opts.rand);

		// Batas bayar: jendela dari pengaturan, tetapi tidak melewati deadline PO terdekat
		const { payWindowHours } = getSettings(tx);
		const earliestClose = Math.min(...cart.lines.map((l) => l.batch!.closesAt));
		const payBy = new Date(Math.min(now.getTime() + payWindowHours * HOUR, earliestClose));

		const token = randomBytes(16).toString('base64url');
		const { id } = tx
			.insert(orders)
			.values({
				code: token,
				token,
				partnerId: partner.id,
				partnerCode: partner.code,
				customerName: input.name,
				phone: input.phone,
				email: input.email || null,
				address: input.address,
				city: input.city,
				postalCode: input.postalCode,
				note: input.note,
				shippingZone: zone.name,
				shippingFee: zone.fee,
				subtotal: cart.subtotal,
				uniqueCode,
				total: base + uniqueCode,
				status: 'pending_payment',
				payBy,
				createdAt: now,
				updatedAt: now
			})
			.returning({ id: orders.id })
			.get();

		const code = orderCode(id, now);
		tx.update(orders).set({ code }).where(eq(orders.id, id)).run();
		for (const l of cart.lines) {
			tx.insert(orderItems)
				.values({
					orderId: id,
					productId: l.productId,
					batchId: l.batch!.id,
					productName: l.name,
					unitPrice: l.price,
					size: l.size,
					qty: l.qty
				})
				.run();
		}
		return { id, code, token };
	});
}

function loadView(db: Conn, order: Order, lang: Lang = 'id'): OrderView {
	const items = db
		.select({ item: orderItems, slug: products.slug, images: products.images, nameEn: products.nameEn })
		.from(orderItems)
		.leftJoin(products, eq(products.id, orderItems.productId))
		.where(eq(orderItems.orderId, order.id))
		.orderBy(asc(orderItems.id))
		.all();
	const batchIds = [...new Set(items.map((r) => r.item.batchId))];
	const batches = batchIds.length
		? db.select().from(poBatches).where(inArray(poBatches.id, batchIds)).all()
		: [];
	const collected = collectedByBatch(db, batchIds);
	const batchById = new Map(batches.map((b) => [b.id, toBatchView(b, collected)]));
	const refundRows = db
		.select()
		.from(refunds)
		.where(eq(refunds.orderId, order.id))
		.orderBy(asc(refunds.id))
		.all();

	return {
		id: order.id,
		code: order.code,
		token: order.token,
		partnerCode: order.partnerCode,
		customerName: order.customerName,
		phone: order.phone,
		email: order.email,
		address: order.address,
		city: order.city,
		postalCode: order.postalCode,
		note: order.note,
		shippingZone: order.shippingZone,
		shippingFee: order.shippingFee,
		subtotal: order.subtotal,
		uniqueCode: order.uniqueCode,
		total: order.total,
		status: order.status,
		payBy: order.payBy.getTime(),
		hasProof: !!order.proofPath,
		proofAt: order.proofAt?.getTime() ?? null,
		rejectReason: order.rejectReason,
		paidAt: order.paidAt?.getTime() ?? null,
		trackingNo: order.trackingNo,
		shippedAt: order.shippedAt?.getTime() ?? null,
		cancelledAt: order.cancelledAt?.getTime() ?? null,
		cancelReason: order.cancelReason,
		createdAt: order.createdAt.getTime(),
		items: items.map(({ item, slug, images, nameEn }) => ({
			id: item.id,
			productId: item.productId,
			productSlug: slug,
			productName: lang === 'en' && nameEn ? nameEn : item.productName,
			image: images?.[0] ?? null,
			unitPrice: item.unitPrice,
			size: item.size,
			qty: item.qty,
			batch: batchById.get(item.batchId)!,
			refunded: item.refundId !== null
		})),
		refunds: refundRows.map((r) => ({
			id: r.id,
			amount: r.amount,
			reason: r.reason,
			status: r.status,
			destination: r.destination,
			note: r.note,
			createdAt: r.createdAt.getTime(),
			doneAt: r.doneAt?.getTime() ?? null
		}))
	};
}

export function getOrderByToken(db: Conn, token: string, lang: Lang = 'id'): OrderView | null {
	const o = db.select().from(orders).where(eq(orders.token, token)).get();
	return o ? loadView(db, o, lang) : null;
}

export function getOrderById(db: Conn, id: number): OrderView | null {
	const o = db.select().from(orders).where(eq(orders.id, id)).get();
	return o ? loadView(db, o) : null;
}

/** Cek pesanan: nomor pesanan + nomor WhatsApp pemesan */
export function findOrderToken(db: Conn, code: string, phone: string): string | null {
	const o = db
		.select({ token: orders.token, phone: orders.phone })
		.from(orders)
		.where(eq(orders.code, code))
		.get();
	return o && o.phone === phone ? o.token : null;
}

function getOrderRow(db: Conn, id: number) {
	const o = db.select().from(orders).where(eq(orders.id, id)).get();
	if (!o) throw new ShopError('Pesanan tidak ditemukan.');
	return o;
}

/** Pembeli mengunggah bukti bayar → menunggu konfirmasi admin */
export function attachProof(db: Conn, orderId: number, proofPath: string, now: Date) {
	const o = getOrderRow(db, orderId);
	if (o.status !== 'pending_payment' && o.status !== 'pending_confirmation') throw shopError('err.proofNotAllowed');
	if (now.getTime() > o.payBy.getTime()) throw shopError('err.payExpired');
	db.update(orders)
		.set({
			proofPath,
			proofAt: now,
			rejectReason: null,
			status: 'pending_confirmation',
			updatedAt: now
		})
		.where(eq(orders.id, orderId))
		.run();
}

/** Admin mencocokkan nominal unik di GoPay Merchant lalu menandai lunas */
export function confirmPayment(db: Conn, orderId: number, now: Date) {
	const o = getOrderRow(db, orderId);
	if (o.status !== 'pending_confirmation' && o.status !== 'pending_payment')
		throw new ShopError('Pesanan ini tidak sedang menunggu pembayaran.');
	db.update(orders)
		.set({ status: 'paid', paidAt: now, rejectReason: null, updatedAt: now })
		.where(eq(orders.id, orderId))
		.run();
}

/** Bukti tidak cocok → pembeli bisa unggah ulang; batas bayar diperpanjang secukupnya */
export function rejectPayment(db: Conn, orderId: number, reason: string, now: Date) {
	const o = getOrderRow(db, orderId);
	if (o.status !== 'pending_confirmation') throw new ShopError('Pesanan ini tidak sedang menunggu konfirmasi.');
	const closes = db
		.select({ closesAt: poBatches.closesAt })
		.from(orderItems)
		.innerJoin(poBatches, eq(poBatches.id, orderItems.batchId))
		.where(eq(orderItems.orderId, orderId))
		.all()
		.map((r) => r.closesAt.getTime());
	const payBy = Math.max(o.payBy.getTime(), Math.min(now.getTime() + 12 * HOUR, ...closes));
	db.update(orders)
		.set({ status: 'pending_payment', rejectReason: reason, payBy: new Date(payBy), updatedAt: now })
		.where(eq(orders.id, orderId))
		.run();
}

/** Buat refund untuk item yang belum direfund; `whole` = sisa nominal pesanan (termasuk ongkir & kode unik) */
export function createRefund(
	db: Conn,
	order: Order,
	itemIds: number[],
	reason: 'po_failed' | 'cancelled' | 'unconfirmed',
	opts: { whole: boolean; now: Date }
) {
	const items = db
		.select()
		.from(orderItems)
		.where(and(eq(orderItems.orderId, order.id), isNull(orderItems.refundId)))
		.all()
		.filter((i) => itemIds.includes(i.id));
	let amount = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
	if (opts.whole) {
		const already = db
			.select({ amount: refunds.amount })
			.from(refunds)
			.where(and(eq(refunds.orderId, order.id), ne(refunds.status, 'void')))
			.all()
			.reduce((s, r) => s + r.amount, 0);
		amount = Math.max(0, order.total - already);
	}
	if (amount <= 0 && !items.length) return null;
	const { id } = db
		.insert(refunds)
		.values({ orderId: order.id, amount, reason, status: 'pending', createdAt: opts.now, updatedAt: opts.now })
		.returning({ id: refunds.id })
		.get();
	if (items.length)
		db.update(orderItems)
			.set({ refundId: id })
			.where(
				inArray(
					orderItems.id,
					items.map((i) => i.id)
				)
			)
			.run();
	return id;
}

/** Pembatalan oleh admin (mis. permintaan pembeli lewat WhatsApp). Pesanan lunas otomatis masuk daftar refund */
export function cancelOrder(db: Conn, orderId: number, reason: string, now: Date) {
	return db.transaction((tx) => {
		const o = getOrderRow(tx, orderId);
		if (o.status === 'cancelled') throw new ShopError('Pesanan sudah dibatalkan.');
		if (o.status === 'shipped') throw new ShopError('Pesanan yang sudah dikirim tidak bisa dibatalkan.');
		if (o.status === 'paid') {
			const open = tx
				.select({ id: orderItems.id })
				.from(orderItems)
				.where(and(eq(orderItems.orderId, o.id), isNull(orderItems.refundId)))
				.all()
				.map((r) => r.id);
			createRefund(tx, o, open, 'cancelled', { whole: true, now });
		}
		tx.update(orders)
			.set({ status: 'cancelled', cancelledAt: now, cancelReason: reason, updatedAt: now })
			.where(eq(orders.id, orderId))
			.run();
	});
}

/** Siap kirim: lunas, dan semua item yang tidak direfund sudah lolos PO (produksi/selesai) */
export function isReadyToShip(view: Pick<OrderView, 'status' | 'items'>) {
	if (view.status !== 'paid') return false;
	const active = view.items.filter((i) => !i.refunded);
	return active.length > 0 && active.every((i) => i.batch.status === 'production' || i.batch.status === 'done');
}

export function markShipped(db: Conn, orderId: number, trackingNo: string, now: Date) {
	const view = getOrderById(db, orderId);
	if (!view) throw new ShopError('Pesanan tidak ditemukan.');
	if (!isReadyToShip(view))
		throw new ShopError('Pesanan belum bisa dikirim: masih ada produk yang PO-nya belum selesai atau belum lunas.');
	db.update(orders)
		.set({ status: 'shipped', trackingNo, shippedAt: now, updatedAt: now })
		.where(eq(orders.id, orderId))
		.run();
}

export function setRefundStatus(
	db: Conn,
	refundId: number,
	status: 'done' | 'void' | 'pending',
	data: { destination?: string; note?: string },
	now: Date
) {
	const r = db.select().from(refunds).where(eq(refunds.id, refundId)).get();
	if (!r) throw new ShopError('Refund tidak ditemukan.');
	db.update(refunds)
		.set({
			status,
			destination: data.destination ?? r.destination,
			note: data.note ?? r.note,
			doneAt: status === 'pending' ? null : now,
			updatedAt: now
		})
		.where(eq(refunds.id, refundId))
		.run();
}

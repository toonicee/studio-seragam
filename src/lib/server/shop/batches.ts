/** Kelola PO (batch) per produk dari halaman admin */
import { and, asc, desc, eq, inArray, isNull, sql } from 'drizzle-orm';
import type { Conn } from '../db';
import { orderItems, orders, poBatches, products } from '../db/schema';
import { collectedByBatch, toBatchView } from './catalog';
import { ShopError } from './orders';

export interface BatchInput {
	target: number;
	closesAt: Date;
	productionDays: number;
}

export function listBatchesForProduct(db: Conn, productId: number) {
	const rows = db
		.select()
		.from(poBatches)
		.where(eq(poBatches.productId, productId))
		.orderBy(desc(poBatches.batchNo))
		.all();
	const collected = collectedByBatch(
		db,
		rows.map((b) => b.id)
	);
	return rows.map((b) => ({ ...toBatchView(b, collected), closedAt: b.closedAt?.getTime() ?? null }));
}

export function openBatch(db: Conn, productId: number, input: BatchInput, now: Date) {
	return db.transaction((tx) => {
		const product = tx.select({ id: products.id }).from(products).where(eq(products.id, productId)).get();
		if (!product) throw new ShopError('Produk tidak ditemukan.');
		const open = tx
			.select({ id: poBatches.id })
			.from(poBatches)
			.where(and(eq(poBatches.productId, productId), eq(poBatches.status, 'open')))
			.get();
		if (open) throw new ShopError('Masih ada PO yang dibuka untuk produk ini.');
		if (input.closesAt.getTime() <= now.getTime()) throw new ShopError('Tanggal tutup harus setelah hari ini.', 'closeDate');
		const last = tx
			.select({ n: sql<number>`max(${poBatches.batchNo})` })
			.from(poBatches)
			.where(eq(poBatches.productId, productId))
			.get();
		const { id } = tx
			.insert(poBatches)
			.values({
				productId,
				batchNo: (last?.n ?? 0) + 1,
				target: input.target,
				closesAt: input.closesAt,
				productionDays: input.productionDays,
				status: 'open',
				createdAt: now,
				updatedAt: now
			})
			.returning({ id: poBatches.id })
			.get();
		return id;
	});
}

/** Ubah target / deadline PO yang masih dibuka (mis. diperpanjang) */
export function updateOpenBatch(db: Conn, batchId: number, input: BatchInput, now: Date) {
	const b = db.select().from(poBatches).where(eq(poBatches.id, batchId)).get();
	if (!b) throw new ShopError('PO tidak ditemukan.');
	if (b.status !== 'open') throw new ShopError('PO sudah ditutup dan tidak bisa diubah.');
	if (input.closesAt.getTime() <= now.getTime()) throw new ShopError('Tanggal tutup harus setelah hari ini.', 'closeDate');
	db.update(poBatches)
		.set({ target: input.target, closesAt: input.closesAt, productionDays: input.productionDays, updatedAt: now })
		.where(eq(poBatches.id, batchId))
		.run();
}

/** Produksi selesai & semua pesanan terkirim → PO selesai (produk bisa dibuka PO lagi) */
export function markBatchDone(db: Conn, batchId: number, now: Date) {
	const b = db.select().from(poBatches).where(eq(poBatches.id, batchId)).get();
	if (!b) throw new ShopError('PO tidak ditemukan.');
	if (b.status !== 'production') throw new ShopError('Hanya PO yang sedang diproduksi yang bisa ditandai selesai.');
	db.update(poBatches).set({ status: 'done', updatedAt: now }).where(eq(poBatches.id, batchId)).run();
}

/** Semua PO dengan nama produk & progres, untuk dashboard admin */
export function listAllBatches(db: Conn) {
	const rows = db
		.select({ b: poBatches, productName: products.name, productSlug: products.slug })
		.from(poBatches)
		.innerJoin(products, eq(products.id, poBatches.productId))
		.orderBy(asc(poBatches.status), asc(poBatches.closesAt))
		.all();
	const collected = collectedByBatch(
		db,
		rows.map((r) => r.b.id)
	);
	return rows.map((r) => ({
		...toBatchView(r.b, collected),
		productId: r.b.productId,
		productName: r.productName,
		productSlug: r.productSlug,
		closedAt: r.b.closedAt?.getTime() ?? null
	}));
}

export function getBatch(db: Conn, batchId: number) {
	const row = db
		.select({ b: poBatches, productName: products.name, productSlug: products.slug })
		.from(poBatches)
		.innerJoin(products, eq(products.id, poBatches.productId))
		.where(eq(poBatches.id, batchId))
		.get();
	if (!row) return null;
	const collected = collectedByBatch(db, [batchId]);
	return {
		...toBatchView(row.b, collected),
		productId: row.b.productId,
		productName: row.productName,
		productSlug: row.productSlug,
		closedAt: row.b.closedAt?.getTime() ?? null
	};
}

/** Pesanan lunas di PO ini (untuk rekap produksi & CSV) */
export function batchOrderLines(db: Conn, batchId: number) {
	return db
		.select({
			orderId: orders.id,
			code: orders.code,
			status: orders.status,
			customerName: orders.customerName,
			phone: orders.phone,
			partnerCode: orders.partnerCode,
			address: orders.address,
			city: orders.city,
			postalCode: orders.postalCode,
			size: orderItems.size,
			qty: orderItems.qty,
			unitPrice: orderItems.unitPrice
		})
		.from(orderItems)
		.innerJoin(orders, eq(orders.id, orderItems.orderId))
		.where(
			and(
				eq(orderItems.batchId, batchId),
				isNull(orderItems.refundId),
				inArray(orders.status, ['paid', 'shipped'])
			)
		)
		.orderBy(asc(orders.id))
		.all();
}

/** Rekap jumlah per ukuran untuk vendor produksi */
export function sizeRecap(lines: { size: string | null; qty: number }[], sizeOrder: string[]) {
	const map = new Map<string, number>();
	for (const l of lines) {
		const k = l.size ?? 'Satu ukuran';
		map.set(k, (map.get(k) ?? 0) + l.qty);
	}
	const rank = (s: string) => {
		const i = sizeOrder.indexOf(s);
		return i === -1 ? 999 : i;
	};
	return [...map.entries()]
		.sort((a, b) => rank(a[0]) - rank(b[0]) || a[0].localeCompare(b[0]))
		.map(([size, qty]) => ({ size, qty }));
}

import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';
import { wibDeadline } from '$lib/shop/po';
import { createDb, runMigrations, type DB } from '../db';
import { categories, orderItems, orders, partners, poBatches, products, refunds, shippingZones } from '../db/schema';
import { collectedByBatch } from './catalog';
import type { CartLine } from './cart';
import {
	attachProof,
	cancelOrder,
	confirmPayment,
	createOrder,
	getOrderById,
	markShipped,
	pickUniqueCode,
	rejectPayment,
	ShopError,
	type NewOrder
} from './orders';
import { runScheduledTasks } from './scheduler';

const NOW = new Date('2026-10-21T03:00:00Z'); // 21 Okt 10:00 WIB
const HOUR = 3600_000;

let db: DB;
let ids: { kaos: number; mug: number; kaosBatch: number; mugBatch: number; zone: number };

function setup() {
	db = createDb(':memory:');
	runMigrations(db);
	const cat = db.insert(categories).values({ slug: 'pakaian', name: 'Pakaian' }).returning().get();
	const kaos = db
		.insert(products)
		.values({ slug: 'kaos', categoryId: cat.id, name: 'Kaos', price: 72000, sizes: ['M', 'L'] })
		.returning()
		.get();
	const mug = db.insert(products).values({ slug: 'mug', categoryId: cat.id, name: 'Mug', price: 40000 }).returning().get();
	const kaosBatch = db
		.insert(poBatches)
		.values({ productId: kaos.id, batchNo: 1, target: 3, closesAt: wibDeadline('2026-10-25'), productionDays: 14 })
		.returning()
		.get();
	const mugBatch = db
		.insert(poBatches)
		.values({ productId: mug.id, batchNo: 1, target: 10, closesAt: wibDeadline('2026-10-22'), productionDays: 14 })
		.returning()
		.get();
	const zone = db.insert(shippingZones).values({ name: 'Flat', fee: 20000 }).returning().get();
	db.insert(partners).values({ code: 'MITRA-1', name: 'Mitra Satu', phone: '6281200000001' }).run();
	db.insert(partners).values({ code: 'MATI', name: 'Mitra Nonaktif', phone: '6281200000009', active: false }).run();
	ids = { kaos: kaos.id, mug: mug.id, kaosBatch: kaosBatch.id, mugBatch: mugBatch.id, zone: zone.id };
}

const buyer = (over: Partial<NewOrder> = {}): NewOrder => ({
	partnerCode: 'mitra-1',
	phone: '6281200000001',
	name: 'Budi',
	email: '',
	address: 'Jl. Contoh No. 1',
	city: 'Medan',
	postalCode: '20111',
	zoneId: ids.zone,
	note: '',
	...over
});

const kaosLine = (qty = 1, size = 'M'): CartLine => ({ productId: ids.kaos, size, qty });
const mugLine = (qty = 1): CartLine => ({ productId: ids.mug, size: null, qty });

function paidOrder(lines: CartLine[], at = NOW) {
	const o = createOrder(db, buyer(), lines, at);
	confirmPayment(db, o.id, at);
	return o;
}

beforeEach(setup);

describe('checkout', () => {
	it('membuat pesanan dengan total = subtotal + ongkir + kode unik', () => {
		const o = createOrder(db, buyer(), [kaosLine(2)], NOW, { rand: () => 37 });
		const view = getOrderById(db, o.id)!;
		expect(view.subtotal).toBe(144000);
		expect(view.uniqueCode).toBe(37);
		expect(view.total).toBe(144000 + 20000 + 37);
		expect(view.status).toBe('pending_payment');
		expect(view.code).toMatch(/^IE-261021-\d{4}$/);
		expect(view.items[0].batch.id).toBe(ids.kaosBatch);
	});

	it('kode unik tidak bentrok dengan pesanan aktif lain', () => {
		const a = createOrder(db, buyer(), [kaosLine()], NOW, { rand: () => 5 });
		const b = createOrder(db, buyer(), [kaosLine()], NOW, { rand: () => 5 });
		expect(getOrderById(db, a.id)!.total).not.toBe(getOrderById(db, b.id)!.total);
		expect(pickUniqueCode(1000, new Set([1001, 1002]), () => 1)).toBe(3);
	});

	it('batas bayar tidak melewati deadline PO terdekat', () => {
		const late = new Date(wibDeadline('2026-10-22').getTime() - 2 * HOUR);
		const o = createOrder(db, buyer(), [mugLine()], late);
		expect(getOrderById(db, o.id)!.payBy).toBe(wibDeadline('2026-10-22').getTime());
		const early = createOrder(db, buyer(), [kaosLine()], NOW);
		expect(getOrderById(db, early.id)!.payBy).toBe(NOW.getTime() + 24 * HOUR);
	});

	it('menolak mitra salah/nonaktif, PO tutup, dan ukuran tidak valid', () => {
		expect(() => createOrder(db, buyer({ phone: '6281299999999' }), [kaosLine()], NOW)).toThrow(ShopError);
		expect(() => createOrder(db, buyer({ partnerCode: 'MATI', phone: '6281200000009' }), [kaosLine()], NOW)).toThrow(
			/tidak cocok/
		);
		const afterMug = new Date(wibDeadline('2026-10-22').getTime() + 1000);
		expect(() => createOrder(db, buyer(), [mugLine()], afterMug)).toThrow(/PO ditutup/);
		expect(() => createOrder(db, buyer(), [kaosLine(1, 'XXL')], NOW)).toThrow(/Ukuran/);
	});
});

describe('pembayaran', () => {
	it('bukti → menunggu konfirmasi → lunas, dan baru dihitung setelah lunas', () => {
		const o = createOrder(db, buyer(), [kaosLine(2)], NOW);
		attachProof(db, o.id, 'proofs/x.webp', NOW);
		expect(getOrderById(db, o.id)!.status).toBe('pending_confirmation');
		expect(collectedByBatch(db).get(ids.kaosBatch) ?? 0).toBe(0);
		confirmPayment(db, o.id, NOW);
		expect(getOrderById(db, o.id)!.status).toBe('paid');
		expect(collectedByBatch(db).get(ids.kaosBatch)).toBe(2);
	});

	it('bukti ditolak → kembali menunggu pembayaran dengan alasan', () => {
		const o = createOrder(db, buyer(), [kaosLine()], NOW);
		attachProof(db, o.id, 'proofs/x.webp', NOW);
		rejectPayment(db, o.id, 'Nominal kurang Rp37', new Date(NOW.getTime() + HOUR));
		const v = getOrderById(db, o.id)!;
		expect(v.status).toBe('pending_payment');
		expect(v.rejectReason).toBe('Nominal kurang Rp37');
		expect(v.payBy).toBeGreaterThanOrEqual(NOW.getTime() + 13 * HOUR);
	});

	it('pembatalan pesanan lunas membuat refund sebesar total', () => {
		const o = paidOrder([kaosLine(1)]);
		cancelOrder(db, o.id, 'Permintaan pembeli', NOW);
		const v = getOrderById(db, o.id)!;
		expect(v.status).toBe('cancelled');
		expect(v.refunds).toHaveLength(1);
		expect(v.refunds[0].amount).toBe(v.total);
		expect(v.refunds[0].reason).toBe('cancelled');
	});
});

describe('proses otomatis', () => {
	it('membatalkan pesanan yang lewat batas bayar', () => {
		const o = createOrder(db, buyer(), [kaosLine()], NOW);
		const r = runScheduledTasks(db, new Date(NOW.getTime() + 25 * HOUR));
		expect(r.expiredOrders).toBe(1);
		expect(getOrderById(db, o.id)!.status).toBe('cancelled');
	});

	it('PO yang mencapai target → produksi, lalu bisa dikirim', () => {
		const o = paidOrder([kaosLine(3)]);
		const after = new Date(wibDeadline('2026-10-25').getTime() + HOUR);
		const r = runScheduledTasks(db, after);
		expect(r.closed.find((c) => c.batchId === ids.kaosBatch)).toMatchObject({ status: 'production', collected: 3 });
		markShipped(db, o.id, 'IEX123', after);
		expect(getOrderById(db, o.id)!.status).toBe('shipped');
	});

	it('PO gagal: refund penuh (+ongkir +kode unik) bila seluruh pesanan gagal', () => {
		const o = paidOrder([mugLine(2)]);
		const after = new Date(wibDeadline('2026-10-22').getTime() + HOUR);
		const r = runScheduledTasks(db, after);
		expect(r.closed.find((c) => c.batchId === ids.mugBatch)?.status).toBe('failed');
		const v = getOrderById(db, o.id)!;
		expect(v.status).toBe('cancelled');
		expect(v.refunds).toHaveLength(1);
		expect(v.refunds[0]).toMatchObject({ reason: 'po_failed', status: 'pending', amount: v.total });
	});

	it('PO gagal sebagian: hanya harga produk gagal yang direfund, sisanya tetap jalan', () => {
		const o = paidOrder([kaosLine(3), mugLine(2)]);
		const after = new Date(wibDeadline('2026-10-22').getTime() + HOUR);
		runScheduledTasks(db, after);
		const v = getOrderById(db, o.id)!;
		expect(v.status).toBe('paid');
		expect(v.refunds).toHaveLength(1);
		expect(v.refunds[0].amount).toBe(80000);
		expect(v.items.find((i) => i.productId === ids.mug)!.refunded).toBe(true);
		expect(v.items.find((i) => i.productId === ids.kaos)!.refunded).toBe(false);
		// Kaos tetap dihitung, mug tidak
		expect(collectedByBatch(db).get(ids.kaosBatch)).toBe(3);
	});

	it('pesanan belum terkonfirmasi saat PO tutup dibatalkan; yang ada bukti masuk daftar refund', () => {
		const withProof = createOrder(db, buyer(), [mugLine()], NOW);
		attachProof(db, withProof.id, 'proofs/x.webp', NOW);
		const noProof = createOrder(db, buyer(), [mugLine()], NOW);
		runScheduledTasks(db, new Date(wibDeadline('2026-10-22').getTime() + HOUR));
		const a = getOrderById(db, withProof.id)!;
		const b = getOrderById(db, noProof.id)!;
		expect(a.status).toBe('cancelled');
		expect(a.refunds[0]).toMatchObject({ reason: 'unconfirmed', amount: a.total });
		expect(b.status).toBe('cancelled');
		expect(b.refunds).toHaveLength(0);
	});

	it('idempoten: dijalankan dua kali hasilnya sama', () => {
		paidOrder([mugLine(1)]);
		const after = new Date(wibDeadline('2026-10-22').getTime() + HOUR);
		runScheduledTasks(db, after);
		const second = runScheduledTasks(db, after);
		expect(second.closed).toHaveLength(0);
		expect(second.refundsCreated).toBe(0);
		expect(db.select().from(refunds).all()).toHaveLength(1);
		const batch = db.select().from(poBatches).where(eq(poBatches.id, ids.mugBatch)).get()!;
		expect(batch).toMatchObject({ status: 'failed', collectedAtClose: 1 });
		expect(db.select().from(orderItems).all().every((i) => i.refundId !== null)).toBe(true);
		expect(db.select().from(orders).all().every((o) => o.status === 'cancelled')).toBe(true);
	});
});

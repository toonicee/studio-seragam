/** Proses otomatis (tiap jam): batalkan pesanan tak dibayar, tutup PO yang lewat deadline, siapkan refund */
import { and, eq, inArray, isNull, lt } from 'drizzle-orm';
import { statusAtDeadline } from '$lib/shop/po';
import type { Conn } from '../db';
import { orderItems, orders, poBatches, type PoBatch } from '../db/schema';
import { collectedByBatch } from './catalog';
import { createRefund } from './orders';
import { setSettings } from './settings';

export interface JobResult {
	expiredOrders: number;
	closed: { batchId: number; productId: number; status: 'production' | 'failed'; collected: number; target: number }[];
	refundsCreated: number;
}

export function runScheduledTasks(db: Conn, now: Date): JobResult {
	return db.transaction((tx) => {
		const result: JobResult = { expiredOrders: 0, closed: [], refundsCreated: 0 };

		// 1. Pesanan yang belum dibayar sampai batas bayar → batal
		result.expiredOrders = tx
			.update(orders)
			.set({
				status: 'cancelled',
				cancelledAt: now,
				cancelReason: 'Batas waktu pembayaran lewat',
				updatedAt: now
			})
			.where(and(eq(orders.status, 'pending_payment'), lt(orders.payBy, now)))
			.returning({ id: orders.id })
			.all().length;

		// 2. PO yang lewat deadline
		const due = tx
			.select()
			.from(poBatches)
			.where(and(eq(poBatches.status, 'open'), lt(poBatches.closesAt, now)))
			.all();
		for (const batch of due) {
			const closed = closeBatch(tx, batch, now);
			result.closed.push(closed.summary);
			result.refundsCreated += closed.refunds;
		}

		setSettings(tx, { lastJobRun: now.getTime() });
		return result;
	});
}

function closeBatch(tx: Conn, batch: PoBatch, now: Date) {
	let refunds = 0;

	// a. Pesanan yang belum dikonfirmasi saat PO ditutup ikut dibatalkan (aturan PRD).
	//    Yang sudah mengunggah bukti masuk daftar refund supaya admin mengecek dananya.
	const pending = tx
		.selectDistinct({ order: orders })
		.from(orders)
		.innerJoin(orderItems, eq(orderItems.orderId, orders.id))
		.where(
			and(
				eq(orderItems.batchId, batch.id),
				inArray(orders.status, ['pending_payment', 'pending_confirmation'])
			)
		)
		.all()
		.map((r) => r.order);
	for (const o of pending) {
		if (o.status === 'pending_confirmation' && o.proofPath) {
			const ids = tx
				.select({ id: orderItems.id })
				.from(orderItems)
				.where(eq(orderItems.orderId, o.id))
				.all()
				.map((r) => r.id);
			if (createRefund(tx, o, ids, 'unconfirmed', { whole: true, now })) refunds++;
		}
		tx.update(orders)
			.set({
				status: 'cancelled',
				cancelledAt: now,
				cancelReason: 'PO ditutup sebelum pembayaran dikonfirmasi',
				updatedAt: now
			})
			.where(eq(orders.id, o.id))
			.run();
	}

	// b. Hitung hasil PO dari pesanan yang sudah lunas
	const collected = collectedByBatch(tx, [batch.id]).get(batch.id) ?? 0;
	const status = statusAtDeadline(collected, batch.target);
	tx.update(poBatches)
		.set({ status, closedAt: now, collectedAtClose: collected, updatedAt: now })
		.where(eq(poBatches.id, batch.id))
		.run();

	// c. Gagal → refund per pesanan. Jika semua isi pesanan gagal, ongkir & kode unik ikut kembali
	if (status === 'failed') {
		const rows = tx
			.select({ order: orders, itemId: orderItems.id })
			.from(orderItems)
			.innerJoin(orders, eq(orders.id, orderItems.orderId))
			.where(and(eq(orderItems.batchId, batch.id), isNull(orderItems.refundId), eq(orders.status, 'paid')))
			.all();
		const byOrder = new Map<number, { order: (typeof rows)[number]['order']; itemIds: number[] }>();
		for (const r of rows) {
			const g = byOrder.get(r.order.id) ?? { order: r.order, itemIds: [] };
			g.itemIds.push(r.itemId);
			byOrder.set(r.order.id, g);
		}
		for (const { order, itemIds } of byOrder.values()) {
			const others = tx
				.select({ id: orderItems.id })
				.from(orderItems)
				.where(and(eq(orderItems.orderId, order.id), isNull(orderItems.refundId)))
				.all()
				.filter((i) => !itemIds.includes(i.id));
			const whole = others.length === 0;
			if (createRefund(tx, order, itemIds, 'po_failed', { whole, now })) refunds++;
			if (whole) {
				tx.update(orders)
					.set({
						status: 'cancelled',
						cancelledAt: now,
						cancelReason: 'PO tidak mencapai target',
						updatedAt: now
					})
					.where(eq(orders.id, order.id))
					.run();
			}
		}
	}

	return {
		refunds,
		summary: {
			batchId: batch.id,
			productId: batch.productId,
			status,
			collected,
			target: batch.target
		}
	};
}

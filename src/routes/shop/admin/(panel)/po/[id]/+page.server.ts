import { error, fail } from '@sveltejs/kit';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { orderItems, orders, products } from '$lib/server/db/schema';
import { batchOrderLines, getBatch, markBatchDone, sizeRecap } from '$lib/server/shop/batches';
import { requireAdmin } from '$lib/server/shop/guard';
import { ShopError } from '$lib/server/shop/orders';
import { SIZE_ORDER } from '$lib/constants/catalog';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const db = getDb();
	const batch = getBatch(db, Number(params.id));
	if (!batch) error(404, 'PO tidak ditemukan');
	const lines = batchOrderLines(db, batch.id);
	const product = db.select({ sizes: products.sizes }).from(products).where(eq(products.id, batch.productId)).get();
	const pending = db
		.select({ status: orders.status, pcs: sql<number>`sum(${orderItems.qty})` })
		.from(orderItems)
		.innerJoin(orders, eq(orders.id, orderItems.orderId))
		.where(and(eq(orderItems.batchId, batch.id), inArray(orders.status, ['pending_payment', 'pending_confirmation'])))
		.groupBy(orders.status)
		.all();
	return {
		batch,
		lines,
		recap: sizeRecap(lines, [...(product?.sizes ?? []), ...SIZE_ORDER]),
		pending: Object.fromEntries(pending.map((p) => [p.status, Number(p.pcs)])) as Record<string, number>
	};
};

export const actions: Actions = {
	done: async ({ params, locals }) => {
		requireAdmin(locals);
		try {
			markBatchDone(getDb(), Number(params.id), new Date());
		} catch (e) {
			if (e instanceof ShopError) return fail(400, { message: e.message });
			throw e;
		}
		return { ok: 'PO ditandai selesai' };
	}
};

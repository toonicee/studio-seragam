import { eq, sql } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { orders, refunds } from '$lib/server/db/schema';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, depends }) => {
	depends('admin:counts');
	const db = getDb();
	const n = (q: { n: number } | undefined) => q?.n ?? 0;
	return {
		user: { email: locals.user?.email ?? '', name: locals.user?.name ?? '' },
		now: Date.now(),
		counts: {
			payments: n(db.select({ n: sql<number>`count(*)` }).from(orders).where(eq(orders.status, 'pending_confirmation')).get()),
			refunds: n(db.select({ n: sql<number>`count(*)` }).from(refunds).where(eq(refunds.status, 'pending')).get())
		}
	};
};

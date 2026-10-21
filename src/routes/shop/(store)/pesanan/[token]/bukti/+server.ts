import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { orders } from '$lib/server/db/schema';
import { imageResponse, readUpload } from '$lib/server/shop/uploads';
import type { RequestHandler } from './$types';

/** Bukti bayar hanya untuk pemegang link pesanan */
export const GET: RequestHandler = async ({ params }) => {
	const o = getDb().select({ proofPath: orders.proofPath }).from(orders).where(eq(orders.token, params.token)).get();
	const buf = o?.proofPath ? await readUpload(o.proofPath, false) : null;
	if (!buf) error(404, 'Bukti bayar tidak ditemukan');
	return imageResponse(buf, 'private, no-store');
};

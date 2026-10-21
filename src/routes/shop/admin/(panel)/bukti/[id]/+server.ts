import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { getProofPath } from '$lib/server/shop/admin';
import { requireAdmin } from '$lib/server/shop/guard';
import { imageResponse, readUpload } from '$lib/server/shop/uploads';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	requireAdmin(locals);
	const rel = getProofPath(getDb(), Number(params.id));
	const buf = rel ? await readUpload(rel, false) : null;
	if (!buf) error(404, 'Bukti bayar tidak ditemukan');
	return imageResponse(buf, 'private, no-store');
};

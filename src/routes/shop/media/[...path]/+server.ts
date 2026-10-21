import { error } from '@sveltejs/kit';
import { imageResponse, readUpload } from '$lib/server/shop/uploads';
import type { RequestHandler } from './$types';

/** Foto produk & QRIS yang diunggah admin (folder uploads/public). Nama file unik → boleh di-cache lama */
export const GET: RequestHandler = async ({ params }) => {
	const buf = await readUpload(params.path, true);
	if (!buf) error(404, 'File tidak ditemukan');
	return imageResponse(buf, 'public, max-age=31536000, immutable');
};

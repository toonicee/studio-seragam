import { error, fail } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { attachProof, getOrderByToken, ShopError } from '$lib/server/shop/orders';
import { getSettings } from '$lib/server/shop/settings';
import { mediaUrl, saveImage } from '$lib/server/shop/uploads';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const db = getDb();
	const order = getOrderByToken(db, params.token);
	if (!order) error(404, 'Pesanan tidak ditemukan. Periksa kembali link pesanan Anda.');
	const s = getSettings(db);
	return {
		order,
		qrisUrl: s.qrisImage ? mediaUrl(s.qrisImage) : null,
		merchantName: s.merchantName,
		statusUrl: `${url.origin}/shop/pesanan/${order.token}`,
		isNew: url.searchParams.has('baru')
	};
};

export const actions: Actions = {
	proof: async ({ request, params }) => {
		const db = getDb();
		const order = getOrderByToken(db, params.token);
		if (!order) error(404, 'Pesanan tidak ditemukan');
		try {
			const file = (await request.formData()).get('proof');
			if (order.status !== 'pending_payment' && order.status !== 'pending_confirmation')
				throw new ShopError('Bukti bayar tidak bisa diunggah untuk pesanan ini.');
			const rel = await saveImage(file, 'proofs', { maxSize: 2000, prefix: `pesanan${order.id}` });
			attachProof(db, order.id, rel, new Date());
		} catch (e) {
			if (e instanceof ShopError) return fail(400, { message: e.message });
			throw e;
		}
		return { uploaded: true };
	}
};

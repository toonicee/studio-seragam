import { error, fail } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { getLang } from '$lib/server/shop/lang';
import { attachProof, getOrderByToken, localizeError, shopError, ShopError } from '$lib/server/shop/orders';
import { getSettings } from '$lib/server/shop/settings';
import { mediaUrl, saveImage } from '$lib/server/shop/uploads';
import { translate } from '$lib/shop/i18n';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url, cookies }) => {
	const db = getDb();
	const lang = getLang(cookies);
	const order = getOrderByToken(db, params.token, lang);
	if (!order) error(404, translate(lang, 'err.orderNotFound'));
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
	proof: async ({ request, params, cookies }) => {
		const db = getDb();
		const lang = getLang(cookies);
		const order = getOrderByToken(db, params.token);
		if (!order) error(404, translate(lang, 'err.orderNotFound'));
		try {
			const file = (await request.formData()).get('proof');
			if (order.status !== 'pending_payment' && order.status !== 'pending_confirmation')
				throw shopError('err.proofNotAllowed');
			const rel = await saveImage(file, 'proofs', { maxSize: 2000, prefix: `pesanan${order.id}` });
			attachProof(db, order.id, rel, new Date());
		} catch (e) {
			if (e instanceof ShopError) return fail(400, { message: localizeError(e, lang) });
			throw e;
		}
		return { uploaded: true };
	}
};

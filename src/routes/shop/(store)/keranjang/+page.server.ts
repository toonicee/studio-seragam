import { fail } from '@sveltejs/kit';
import { readCart, removeLine, setLineQty, writeCart } from '$lib/server/shop/cart';
import { getLang } from '$lib/server/shop/lang';
import { MAX_QTY } from '$lib/shop/constants';
import { translate } from '$lib/shop/i18n';
import type { Actions } from './$types';

export const actions: Actions = {
	update: async ({ request, cookies }) => {
		const fd = await request.formData();
		const key = String(fd.get('key') ?? '');
		const qty = Number(fd.get('qty'));
		if (!key || !Number.isInteger(qty) || qty > MAX_QTY)
			return fail(400, { message: translate(getLang(cookies), 'err.qty') });
		writeCart(cookies, setLineQty(readCart(cookies), key, qty));
		return { ok: true };
	},
	remove: async ({ request, cookies }) => {
		const key = String((await request.formData()).get('key') ?? '');
		writeCart(cookies, removeLine(readCart(cookies), key));
		return { ok: true };
	}
};

import { getDb } from '$lib/server/db';
import { readCart, resolveCart } from '$lib/server/shop/cart';
import { listCategories } from '$lib/server/shop/catalog';
import { getLang } from '$lib/server/shop/lang';
import { getSettings } from '$lib/server/shop/settings';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, depends }) => {
	depends('shop:cart');
	const db = getDb();
	const now = Date.now();
	const lang = getLang(cookies);
	return {
		lang,
		now,
		categories: listCategories(db, lang),
		cart: resolveCart(db, readCart(cookies), now, lang),
		waAdmin: getSettings(db).waAdmin
	};
};

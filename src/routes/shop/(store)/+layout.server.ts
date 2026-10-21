import { getDb } from '$lib/server/db';
import { readCart, resolveCart } from '$lib/server/shop/cart';
import { listCategories } from '$lib/server/shop/catalog';
import { getSettings } from '$lib/server/shop/settings';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, depends }) => {
	depends('shop:cart');
	const db = getDb();
	const now = Date.now();
	return {
		now,
		categories: listCategories(db),
		cart: resolveCart(db, readCart(cookies), now),
		waAdmin: getSettings(db).waAdmin
	};
};

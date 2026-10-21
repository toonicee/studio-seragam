import { getDb } from '$lib/server/db';
import { listProducts, searchProducts, sortProducts } from '$lib/server/shop/catalog';
import { getLang } from '$lib/server/shop/lang';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, cookies }) => {
	const q = (url.searchParams.get('q') ?? '').trim().slice(0, 80);
	if (!q) return { q, results: [] };
	const db = getDb();
	const now = Date.now();
	const lang = getLang(cookies);
	const local = listProducts(db, { lang });
	// Cari di kedua bahasa, tampilkan dalam bahasa pembeli
	const ids = new Set([
		...searchProducts(local, q).map((p) => p.id),
		...(lang === 'en' ? searchProducts(listProducts(db), q).map((p) => p.id) : [])
	]);
	return { q, results: sortProducts(local.filter((p) => ids.has(p.id)), 'segera', now) };
};

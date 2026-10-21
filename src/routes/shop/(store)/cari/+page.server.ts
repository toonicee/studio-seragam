import { getDb } from '$lib/server/db';
import { listProducts, searchProducts, sortProducts } from '$lib/server/shop/catalog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const q = (url.searchParams.get('q') ?? '').trim().slice(0, 80);
	const now = Date.now();
	const results = q ? sortProducts(searchProducts(listProducts(getDb()), q), 'segera', now) : [];
	return { q, results };
};

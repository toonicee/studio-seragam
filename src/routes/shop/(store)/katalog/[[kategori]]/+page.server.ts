import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import {
	filterByStatus,
	listCategories,
	listProducts,
	sortProducts,
	SORTS,
	STATUS_FILTERS,
	type SortKey,
	type StatusFilter
} from '$lib/server/shop/catalog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const db = getDb();
	const now = Date.now();
	const category = params.kategori ? listCategories(db).find((c) => c.slug === params.kategori) : null;
	if (params.kategori && !category) error(404, 'Kategori tidak ditemukan');

	const sortParam = url.searchParams.get('urut') ?? '';
	const statusParam = url.searchParams.get('status') ?? '';
	const sort: SortKey = sortParam in SORTS ? (sortParam as SortKey) : 'segera';
	const status: StatusFilter = statusParam in STATUS_FILTERS ? (statusParam as StatusFilter) : 'semua';

	const all = listProducts(db, { categorySlug: category?.slug });
	return {
		category: category ?? null,
		products: sortProducts(filterByStatus(all, status, now), sort, now),
		total: all.length,
		sort,
		status,
		sorts: SORTS,
		statuses: STATUS_FILTERS
	};
};

import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { renderMarkdown } from '$lib/server/shop/markdown';
import { getPage } from '$lib/server/shop/settings';
import { INFO_PAGES } from '$lib/shop/constants';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const page = getPage(getDb(), params.slug);
	if (!page) error(404, 'Halaman tidak ditemukan');
	return {
		slug: page.slug,
		title: page.title,
		html: renderMarkdown(page.body),
		pages: INFO_PAGES
	};
};

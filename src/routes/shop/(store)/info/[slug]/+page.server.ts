import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { getLang } from '$lib/server/shop/lang';
import { renderMarkdown } from '$lib/server/shop/markdown';
import { getPage } from '$lib/server/shop/settings';
import { INFO_PAGES } from '$lib/shop/constants';
import { translate } from '$lib/shop/i18n';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, cookies }) => {
	const lang = getLang(cookies);
	const page = getPage(getDb(), params.slug, lang);
	if (!page) error(404, translate(lang, 'err.pageNotFound'));
	return {
		slug: page.slug,
		title: page.title,
		html: renderMarkdown(page.body),
		pages: INFO_PAGES.map((p) => p.slug)
	};
};

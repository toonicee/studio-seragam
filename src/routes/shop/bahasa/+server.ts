import { redirect } from '@sveltejs/kit';
import { isLang, LANG_COOKIE } from '$lib/shop/i18n';
import type { RequestHandler } from './$types';

/** Ganti bahasa tanpa JavaScript: /shop/bahasa?lang=en&to=/shop/katalog */
export const GET: RequestHandler = async ({ url, cookies }) => {
	const lang = url.searchParams.get('lang');
	if (isLang(lang)) {
		cookies.set(LANG_COOKIE, lang, { path: '/shop', httpOnly: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 });
	}
	const to = url.searchParams.get('to') ?? '/shop';
	redirect(303, to.startsWith('/shop') && !to.startsWith('//') ? to : '/shop');
};

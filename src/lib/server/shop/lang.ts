import type { Cookies } from '@sveltejs/kit';
import { isLang, LANG_COOKIE, type Lang } from '$lib/shop/i18n';

/** Bahasa toko dari cookie `ie_lang` (default Indonesia) */
export function getLang(cookies: Cookies): Lang {
	const v = cookies.get(LANG_COOKIE);
	return isLang(v) ? v : 'id';
}

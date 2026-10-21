/** Pemakaian terjemahan di komponen toko. Bahasa dibaca dari data layout toko (cookie `ie_lang`). */
import { page } from '$app/state';
import { invalidateAll } from '$app/navigation';
import { isLang, LANG_COOKIE, translate, translateN, type Lang, type TKey } from './i18n';

/** Bahasa aktif; halaman admin tidak mengirim `lang` sehingga tetap Indonesia */
export function lang(): Lang {
	const l = (page.data as { lang?: unknown }).lang;
	return isLang(l) ? l : 'id';
}

export const t = (key: TKey, vars?: Record<string, string | number>) => translate(lang(), key, vars);

export const tn = (base: string, n: number, vars?: Record<string, string | number>) =>
	translateN(lang(), base, n, vars);

/** Ganti bahasa tanpa memuat ulang halaman: simpan cookie lalu muat ulang data */
export async function setLang(next: Lang) {
	document.cookie = `${LANG_COOKIE}=${next}; path=/shop; max-age=31536000; samesite=lax`;
	document.documentElement.lang = next;
	await invalidateAll();
}

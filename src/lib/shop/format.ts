/** Format angka, tanggal, dan nomor untuk toko. Semua tanggal ditampilkan dalam WIB. */
import type { Lang } from './i18n';

export const TZ = 'Asia/Jakarta';

/** "Rp130.900" — sama dengan format harga di konfigurator (juga dipakai di versi English) */
export const rupiah = (n: number | null | undefined) =>
	'Rp' + Math.round(n ?? 0).toLocaleString('id-ID');

const fmtCache = new Map<string, Intl.DateTimeFormat>();
function dtf(opts: Intl.DateTimeFormatOptions, lang: Lang = 'id') {
	const key = lang + JSON.stringify(opts);
	let f = fmtCache.get(key);
	if (!f) {
		f = new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'id-ID', { timeZone: TZ, ...opts });
		fmtCache.set(key, f);
	}
	return f;
}

/** "23:59" (locale id-ID memakai titik, toko memakai titik dua seperti di PRD) */
export function fmtTime(ms: number) {
	const parts = dtf({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(ms);
	const h = parts.find((p) => p.type === 'hour')?.value ?? '00';
	const m = parts.find((p) => p.type === 'minute')?.value ?? '00';
	return `${h}:${m}`;
}

/** "31 Okt 2026" / "31 Oct 2026" */
export const fmtDay = (ms: number, lang: Lang = 'id') =>
	dtf({ day: 'numeric', month: 'short', year: 'numeric' }, lang).format(ms);

/** "Jum, 31 Okt 2026" / "Fri, 31 Oct 2026" */
export const fmtDayLong = (ms: number, lang: Lang = 'id') =>
	dtf({ weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }, lang).format(ms);

/** "31 Okt" / "31 Oct" */
export const fmtDayShort = (ms: number, lang: Lang = 'id') =>
	dtf({ day: 'numeric', month: 'short' }, lang).format(ms);

/** "Jum, 31 Okt 2026 · 23:59 WIB" */
export const fmtDeadline = (ms: number, lang: Lang = 'id') => `${fmtDayLong(ms, lang)} · ${fmtTime(ms)} WIB`;

/** "21 Okt 2026, 14:05 WIB" */
export const fmtDateTime = (ms: number, lang: Lang = 'id') => `${fmtDay(ms, lang)}, ${fmtTime(ms)} WIB`;

/** "0812-3456-7890" dari "6281234567890" */
export function fmtPhone(phone: string) {
	const local = phone.startsWith('62') ? '0' + phone.slice(2) : phone;
	return local.replace(/^(\d{4})(\d{4})(\d+)$/, '$1-$2-$3');
}

/** "08xx", "+62 8xx", "8xx" → "628xx". Mengembalikan null bila bukan nomor HP Indonesia */
export function normalizePhone(input: string): string | null {
	let d = input.replace(/\D/g, '');
	if (d.startsWith('0')) d = '62' + d.slice(1);
	else if (d.startsWith('8')) d = '62' + d;
	if (!/^628\d{7,12}$/.test(d)) return null;
	return d;
}

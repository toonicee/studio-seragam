/** Aturan PO (pre-order) toko. Fungsi murni: dipakai server, halaman, dan unit test. */
import { CLOSING_SOON_MS } from './constants';
import type { BatchView } from './types';

const HOUR = 3600_000;
const DAY = 24 * HOUR;
const WIB_OFFSET = 7 * HOUR;

/** Deadline PO: tanggal "YYYY-MM-DD" pukul 23:59:59 WIB (UTC+7, tanpa DST) */
export function wibDeadline(date: string): Date {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`Tanggal tidak valid: ${date}`);
	return new Date(`${date}T23:59:59.000+07:00`);
}

/** Tanggal WIB "YYYY-MM-DD" dari waktu (untuk isian tanggal di form admin) */
export function wibDateString(ms: number): string {
	return new Date(ms + WIB_OFFSET).toISOString().slice(0, 10);
}

/** Tambah n hari kalender WIB ke sebuah tanggal "YYYY-MM-DD" */
export function addDays(date: string, n: number): string {
	const d = new Date(`${date}T00:00:00.000Z`);
	d.setUTCDate(d.getUTCDate() + n);
	return d.toISOString().slice(0, 10);
}

type BatchLike = Pick<BatchView, 'status' | 'closesAt' | 'target' | 'collected'>;

/** Produk boleh dipesan: PO masih dibuka dan belum lewat deadline */
export function isOrderable(batch: Pick<BatchView, 'status' | 'closesAt'> | null | undefined, now: number) {
	return !!batch && batch.status === 'open' && now <= batch.closesAt;
}

export function progress(collected: number, target: number) {
	const t = Math.max(1, target);
	return {
		pct: Math.min(100, Math.round((collected / t) * 100)),
		reached: collected >= target,
		remaining: Math.max(0, target - collected)
	};
}

/** Sisa waktu sampai deadline, untuk label "Sisa 5 hari" */
export function timeLeft(closesAt: number, now: number) {
	const ms = closesAt - now;
	if (ms <= 0) return { ms: 0, days: 0, hours: 0, label: 'Ditutup' };
	const days = Math.floor(ms / DAY);
	const hours = Math.floor(ms / HOUR);
	let label: string;
	if (days >= 1) label = `Sisa ${days} hari`;
	else if (hours >= 1) label = `Sisa ${hours} jam`;
	else label = 'Kurang dari 1 jam';
	return { ms, days, hours, label };
}

/** Estimasi kirim = tanggal tutup PO + lama produksi */
export function shipEstimate(closesAt: number, productionDays: number) {
	return closesAt + productionDays * DAY;
}

/** Status PO saat deadline: target tercapai → produksi, selain itu gagal */
export function statusAtDeadline(collected: number, target: number) {
	return collected >= target ? ('production' as const) : ('failed' as const);
}

export type PoPhase =
	| 'none'
	| 'open'
	| 'closing'
	| 'reached'
	| 'closed'
	| 'production'
	| 'done'
	| 'failed';

/** Tahap PO yang tampil di toko (badge, tombol pesan) */
export function poPhase(batch: BatchLike | null | undefined, now: number): PoPhase {
	if (!batch) return 'none';
	if (batch.status !== 'open') return batch.status;
	if (now > batch.closesAt) return 'closed';
	if (batch.collected >= batch.target) return 'reached';
	if (batch.closesAt - now < CLOSING_SOON_MS) return 'closing';
	return 'open';
}

export type Tone = 'brand' | 'success' | 'warning' | 'muted' | 'danger' | 'ink';

/** Warna badge & boleh-tidaknya dipesan per tahap. Teks badge/alasan ada di i18n (`phase.*`, `reason.*`) */
export const PHASE_META: Record<PoPhase, { tone: Tone; orderable: boolean; hasReason: boolean }> = {
	none: { tone: 'muted', orderable: false, hasReason: true },
	open: { tone: 'brand', orderable: true, hasReason: false },
	closing: { tone: 'warning', orderable: true, hasReason: false },
	reached: { tone: 'success', orderable: true, hasReason: false },
	closed: { tone: 'muted', orderable: false, hasReason: true },
	production: { tone: 'ink', orderable: false, hasReason: true },
	done: { tone: 'muted', orderable: false, hasReason: true },
	failed: { tone: 'danger', orderable: false, hasReason: true }
};

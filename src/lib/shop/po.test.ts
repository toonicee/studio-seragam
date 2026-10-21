import { describe, expect, it } from 'vitest';
import { fmtDeadline, normalizePhone, rupiah } from './format';
import {
	addDays,
	isOrderable,
	poPhase,
	progress,
	shipEstimate,
	statusAtDeadline,
	timeLeft,
	wibDateString,
	wibDeadline
} from './po';

const HOUR = 3600_000;

describe('deadline WIB', () => {
	it('deadline jatuh pukul 23:59:59 WIB (16:59:59 UTC)', () => {
		expect(wibDeadline('2026-10-31').toISOString()).toBe('2026-10-31T16:59:59.000Z');
	});

	it('tanggal WIB dari waktu UTC yang sudah lewat tengah malam WIB', () => {
		// 31 Okt 17:30 UTC = 1 Nov 00:30 WIB
		expect(wibDateString(Date.parse('2026-10-31T17:30:00Z'))).toBe('2026-11-01');
		expect(addDays('2026-10-30', 3)).toBe('2026-11-02');
	});

	it('format deadline memakai titik dua dan WIB', () => {
		expect(fmtDeadline(wibDeadline('2026-10-30').getTime())).toBe('Jum, 30 Okt 2026 · 23:59 WIB');
	});
});

describe('orderable & fase PO', () => {
	const closesAt = wibDeadline('2026-10-31').getTime();
	const batch = { status: 'open' as const, closesAt, target: 10, collected: 3 };

	it('masih bisa dipesan tepat sebelum deadline, tidak setelahnya', () => {
		expect(isOrderable(batch, closesAt - 1)).toBe(true);
		expect(isOrderable(batch, closesAt)).toBe(true);
		expect(isOrderable(batch, closesAt + 1)).toBe(false);
		expect(isOrderable({ ...batch, status: 'production' }, closesAt - HOUR)).toBe(false);
		expect(isOrderable(null, 0)).toBe(false);
	});

	it('fase berubah sesuai progres dan waktu', () => {
		expect(poPhase(batch, closesAt - 72 * HOUR)).toBe('open');
		expect(poPhase(batch, closesAt - 10 * HOUR)).toBe('closing');
		expect(poPhase({ ...batch, collected: 10 }, closesAt - 10 * HOUR)).toBe('reached');
		expect(poPhase(batch, closesAt + HOUR)).toBe('closed');
		expect(poPhase({ ...batch, status: 'failed' }, closesAt + HOUR)).toBe('failed');
		expect(poPhase(null, 0)).toBe('none');
	});

	it('progres, sisa waktu, estimasi kirim, status saat deadline', () => {
		expect(progress(52, 50)).toEqual({ pct: 100, reached: true, remaining: 0 });
		expect(progress(21, 36).pct).toBe(58);
		expect(timeLeft(closesAt, closesAt - 50 * HOUR).label).toBe('Sisa 2 hari');
		expect(timeLeft(closesAt, closesAt - 5 * HOUR).label).toBe('Sisa 5 jam');
		expect(timeLeft(closesAt, closesAt + 1).label).toBe('Ditutup');
		expect(new Date(shipEstimate(closesAt, 14)).toISOString().slice(0, 10)).toBe('2026-11-14');
		expect(statusAtDeadline(36, 36)).toBe('production');
		expect(statusAtDeadline(35, 36)).toBe('failed');
	});
});

describe('format', () => {
	it('rupiah dan nomor WhatsApp', () => {
		expect(rupiah(130937)).toBe('Rp130.937');
		expect(normalizePhone('0812-3456-7890')).toBe('6281234567890');
		expect(normalizePhone('+62 812 3456 7890')).toBe('6281234567890');
		expect(normalizePhone('812345678')).toBe('62812345678');
		expect(normalizePhone('021555')).toBeNull();
	});
});

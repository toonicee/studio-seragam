import { asc, eq } from 'drizzle-orm';
import { CLIENT_CONFIG } from '$lib/client-config';
import type { Lang } from '$lib/shop/i18n';
import type { Conn as DB } from '../db';
import { pages, settings, shippingZones } from '../db/schema';

export interface ShopSettings {
	/** Path unggahan gambar QRIS statis GoPay Merchant (relatif ke DATA_DIR/uploads) */
	qrisImage: string | null;
	merchantName: string;
	/** Nomor WhatsApp admin, format 62… */
	waAdmin: string;
	/** Batas bayar setelah checkout (jam) */
	payWindowHours: number;
	/** Waktu terakhir proses otomatis berjalan (ms) */
	lastJobRun: number | null;
}

export const DEFAULT_SETTINGS: ShopSettings = {
	qrisImage: null,
	merchantName: 'Indah Expres Merchandise',
	waAdmin: CLIENT_CONFIG.waNumber,
	payWindowHours: 24,
	lastJobRun: null
};

export function getSettings(db: DB): ShopSettings {
	const rows = db.select().from(settings).all();
	const out: Record<string, unknown> = { ...DEFAULT_SETTINGS };
	for (const r of rows) if (r.key in DEFAULT_SETTINGS && r.value !== null) out[r.key] = r.value;
	return out as unknown as ShopSettings;
}

export function setSettings(db: DB, patch: Partial<ShopSettings>) {
	for (const [key, value] of Object.entries(patch)) {
		if (!(key in DEFAULT_SETTINGS)) continue;
		db.insert(settings)
			.values({ key, value })
			.onConflictDoUpdate({ target: settings.key, set: { value } })
			.run();
	}
}

export function listZones(db: DB, includeInactive = false) {
	const rows = db.select().from(shippingZones).orderBy(asc(shippingZones.sort), asc(shippingZones.id)).all();
	return includeInactive ? rows : rows.filter((z) => z.active);
}

export function getPage(db: DB, slug: string, lang: Lang = 'id') {
	const p = db.select().from(pages).where(eq(pages.slug, slug)).get();
	if (!p) return null;
	const en = lang === 'en' && p.bodyEn;
	return { slug: p.slug, title: en ? p.titleEn || p.title : p.title, body: en ? p.bodyEn : p.body };
}

export function listPages(db: DB) {
	return db.select().from(pages).all();
}

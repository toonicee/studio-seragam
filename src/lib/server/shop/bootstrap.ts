/** Dijalankan sekali saat server start (hooks.server.ts → init) */
import {
	ADMIN_EMAIL,
	ADMIN_PASSWORD,
	DATA_DIR,
	MIGRATIONS_DIR,
	SEED_DEMO_ORDERS,
	SEED_SAMPLE
} from '$app/env/private';
import { Cron } from 'croner';
import { ensureAdmin } from '../auth';
import { getDb, runMigrations } from '../db';
import { runScheduledTasks } from './scheduler';
import { backfillEnglish, seedDemo, seedSample, syncCategories } from './seed';

export function runJob(source: string) {
	try {
		const r = runScheduledTasks(getDb(), new Date());
		if (r.expiredOrders || r.closed.length || r.refundsCreated) {
			console.info(`[toko] proses otomatis (${source}):`, JSON.stringify(r));
		}
		return r;
	} catch (e) {
		console.error('[toko] proses otomatis gagal', e);
		return null;
	}
}

const g = globalThis as typeof globalThis & { __ieShopCron?: Cron };

export async function bootstrap() {
	// .env dibaca SvelteKit; salin ke process.env untuk modul database
	process.env.DATA_DIR = DATA_DIR;
	if (MIGRATIONS_DIR) process.env.MIGRATIONS_DIR = MIGRATIONS_DIR;

	const db = getDb();
	runMigrations(db);

	const now = new Date();
	// Kategori selalu disiapkan (juga tanpa katalog contoh) supaya admin bisa langsung menambah produk
	syncCategories(db);
	if (SEED_SAMPLE) seedSample(db, now);
	backfillEnglish(db);
	if (SEED_DEMO_ORDERS) await seedDemo(db, now);
	if (await ensureAdmin(ADMIN_EMAIL, ADMIN_PASSWORD)) {
		console.info(`[toko] admin pertama dibuat: ${ADMIN_EMAIL}`);
	}

	// Tutup PO yang terlewat saat server mati, lalu jalankan tiap jam (menit ke-5, WIB)
	runJob('start');
	g.__ieShopCron?.stop();
	g.__ieShopCron = new Cron('5 * * * *', { timezone: 'Asia/Jakarta', protect: true }, () => {
		runJob('cron');
	});
}

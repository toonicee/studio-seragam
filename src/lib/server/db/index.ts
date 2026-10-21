import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';

export function createDb(file: string) {
	const sqlite = new Database(file);
	sqlite.pragma('journal_mode = WAL');
	sqlite.pragma('foreign_keys = ON');
	sqlite.pragma('busy_timeout = 5000');
	return drizzle(sqlite, { schema });
}

export type DB = ReturnType<typeof createDb>;

/** Folder data toko: database + unggahan. Di Docker = volume /data */
export function dataDir() {
	return resolve(process.env.DATA_DIR || 'data');
}

/** Folder migrasi SQL hasil `npm run db:generate` (ikut disalin ke image Docker) */
export function migrationsDir() {
	return resolve(process.env.MIGRATIONS_DIR || 'drizzle');
}

export function runMigrations(db: DB) {
	migrate(db, { migrationsFolder: migrationsDir() });
}

let instance: DB | undefined;

/** Koneksi database dibuat saat pertama dipakai, bukan saat `vite build` menganalisis modul */
export function getDb(): DB {
	if (!instance) {
		const dir = dataDir();
		mkdirSync(dir, { recursive: true });
		instance = createDb(join(dir, 'shop.db'));
	}
	return instance;
}

/** Transaksi Drizzle (better-sqlite3, sinkron) */
export type Tx = Parameters<Parameters<DB['transaction']>[0]>[0];
/** Fungsi toko menerima koneksi biasa maupun transaksi */
export type Conn = DB | Tx;

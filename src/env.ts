import { defineEnvVars } from '@sveltejs/kit/env';

/** Kosong → undefined (variabel opsional) */
const optional = (value: string | undefined) => (value ? value : undefined);
const flag = (value: string | undefined) => value === '1' || value === 'true';

/** Variabel lingkungan toko (/shop), dibaca saat server start lewat `$app/env/private` */
export const variables = defineEnvVars({
	DATA_DIR: {
		schema: (value) => value || './data',
		description: 'Folder database SQLite dan file unggahan toko'
	},
	MIGRATIONS_DIR: {
		schema: optional,
		description: 'Folder migrasi SQL (default ./drizzle)'
	},
	ORIGIN: {
		schema: optional,
		description: 'Alamat publik toko, mis. https://shop.indahexpres.com (wajib di server)'
	},
	BETTER_AUTH_URL: { schema: optional, description: 'Alternatif ORIGIN untuk Better Auth' },
	BETTER_AUTH_SECRET: {
		schema: optional,
		description: 'Kunci rahasia sesi admin, minimal 32 karakter acak'
	},
	ADMIN_EMAIL: { schema: optional, description: 'Email admin pertama (dibuat bila belum ada admin)' },
	ADMIN_PASSWORD: { schema: optional, description: 'Kata sandi admin pertama' },
	SEED_SAMPLE: { schema: flag, description: '1 = isi katalog contoh saat database kosong' },
	SEED_DEMO_ORDERS: {
		schema: flag,
		description: '1 = tambahkan mitra & pesanan contoh (hanya untuk pengembangan)'
	}
});

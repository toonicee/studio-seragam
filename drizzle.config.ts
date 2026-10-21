import { defineConfig } from 'drizzle-kit';

// `npm run db:generate` membuat file migrasi SQL di ./drizzle dari skema.
// Migrasi dijalankan otomatis saat server toko start (src/lib/server/shop/bootstrap.ts).
export default defineConfig({
	dialect: 'sqlite',
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dbCredentials: { url: `${process.env.DATA_DIR || './data'}/shop.db` }
});

import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

/**
 * Tes ujung-ke-ujung toko: build produksi (adapter-node) dengan database sementara di ./test-data,
 * katalog contoh + pesanan demo, dan admin uji.
 */
export default defineConfig({
	testDir: 'tests/e2e',
	workers: 1,
	timeout: 60_000,
	expect: { timeout: 10_000 },
	use: {
		baseURL: `http://localhost:${PORT}`,
		trace: 'retain-on-failure',
		// adapter-node menganggap https kecuali diberi tahu lewat header (di server asli Caddy memberi HTTPS)
		extraHTTPHeaders: { 'x-forwarded-proto': 'http' }
	},
	webServer: {
		command: 'rm -rf test-data && npm run build && node build',
		port: PORT,
		timeout: 240_000,
		reuseExistingServer: false,
		env: {
			PORT: String(PORT),
			ORIGIN: `http://localhost:${PORT}`,
			DATA_DIR: './test-data',
			BETTER_AUTH_SECRET: 'e2e-secret-yang-panjang-sekali-untuk-tes-saja',
			ADMIN_EMAIL: 'admin@e2e.test',
			ADMIN_PASSWORD: 'admin-e2e-12345',
			SEED_SAMPLE: '1',
			SEED_DEMO_ORDERS: '1',
			BODY_SIZE_LIMIT: '10M',
			PROTOCOL_HEADER: 'x-forwarded-proto'
		}
	},
	projects: [
		{ name: 'desktop', use: { ...devices['Desktop Chrome'] }, testIgnore: /mobile/ },
		{ name: 'mobile', use: { ...devices['iPhone 13'], browserName: 'chromium' }, testMatch: /mobile/ }
	]
});

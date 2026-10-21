import { expect, test, type Page } from '@playwright/test';
import Database from 'better-sqlite3';

const ADMIN = { email: 'admin@e2e.test', password: 'admin-e2e-12345' };

async function login(page: Page) {
	await page.goto('/shop/admin', { waitUntil: 'networkidle' });
	await page.fill('#email', ADMIN.email);
	await page.fill('#password', ADMIN.password);
	await page.getByRole('button', { name: 'Masuk' }).click();
	await page.waitForURL('/shop/admin');
}

async function addToCart(page: Page, slug: string, size?: string) {
	await page.goto(`/shop/produk/${slug}`, { waitUntil: 'networkidle' });
	if (size) await page.getByRole('radio', { name: size, exact: true }).click();
	await page.locator('#add-form button[type=submit]').click();
	await expect(page.getByTestId('cart-lines')).toBeVisible();
	await page.keyboard.press('Escape');
}

async function fillCheckout(page: Page, partnerCode: string) {
	await page.goto('/shop/checkout', { waitUntil: 'networkidle' });
	await page.fill('#partnerCode', partnerCode);
	await page.fill('#phone', '0812-3456-7890');
	await page.fill('#name', 'Pembeli Uji');
	await page.fill('#address', 'Jl. Uji Coba No. 1, RT 01/RW 01');
	await page.fill('#city', 'Medan');
	await page.getByRole('button', { name: /Buat pesanan/ }).click();
}

test.describe.configure({ mode: 'serial' });

test('beranda dirender di server dan tidak memuat three.js', async ({ page, request }) => {
	const html = await (await request.get('/shop')).text();
	expect(html).toContain('Kaos Indah Expres');
	expect(html).toContain('PO segera ditutup');

	const scripts: string[] = [];
	page.on('response', async (r) => {
		if (r.url().endsWith('.js')) scripts.push(await r.text().catch(() => ''));
	});
	await page.goto('/shop', { waitUntil: 'networkidle' });
	expect(scripts.length).toBeGreaterThan(0);
	expect(scripts.some((s) => s.includes('WebGLRenderer'))).toBe(false);
});

test('katalog bisa difilter per kategori dan status', async ({ page }) => {
	await page.goto('/shop/katalog/pakaian');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pakaian');
	await expect(page.locator('main li a[href^="/shop/produk/"]')).toHaveCount(5);
	await page.getByRole('link', { name: 'Target tercapai', exact: true }).click();
	await expect(page.locator('main li a[href^="/shop/produk/"]')).toHaveCount(1);
});

let orderCode = '';

test('pembeli: keranjang → checkout → bayar QRIS → unggah bukti', async ({ page }) => {
	await addToCart(page, 'kaos-indah-expres', 'M');
	await addToCart(page, 'topi-indah-expres');
	await expect(page.getByTestId('cart-count')).toHaveText('2');

	await fillCheckout(page, 'demo');
	await page.waitForURL(/\/shop\/pesanan\//);
	orderCode = (await page.getByTestId('order-code').textContent())!.trim();
	expect(orderCode).toMatch(/^IE-\d{6}-\d{4}$/);
	await expect(page.getByTestId('order-status')).toHaveText(/Menunggu pembayaran/);
	// total = 72.000 + 45.000 + ongkir 20.000 + kode unik 1–999
	const amount = Number((await page.getByTestId('pay-amount').textContent())!.replace(/\D/g, ''));
	expect(amount).toBeGreaterThan(137000);
	expect(amount).toBeLessThan(138000);

	await page.setInputFiles('#proof', 'tests/fixtures/bukti-bayar.png');
	await page.getByRole('button', { name: /Kirim bukti/ }).click();
	await expect(page.getByTestId('order-status')).toHaveText(/Menunggu konfirmasi/);
});

test('kode mitra yang tidak terdaftar ditolak', async ({ page }) => {
	await addToCart(page, 'tote-bag-kanvas');
	await fillCheckout(page, 'BUKAN-MITRA');
	await expect(page.getByText(/tidak cocok dengan data mitra aktif/)).toBeVisible();
	expect(page.url()).toContain('/shop/checkout');
});

test('admin wajib login; action admin tanpa sesi ditolak', async ({ page, request }) => {
	await page.goto('/shop/admin/pesanan');
	await expect(page).toHaveURL(/\/shop\/admin\/login\?next=/);
	const res = await request.post('/shop/admin/pembayaran?/confirm', {
		form: { orderId: '1' },
		headers: { origin: 'http://localhost:4173' },
		maxRedirects: 0
	});
	expect(res.status()).toBe(401);
});

test('admin mengonfirmasi pembayaran → pesanan lunas & progres PO naik', async ({ page }) => {
	await login(page);
	await page.goto('/shop/admin/pembayaran', { waitUntil: 'networkidle' });
	const row = page.getByTestId('payment-row').filter({ hasText: orderCode });
	await expect(row).toBeVisible();
	await row.getByRole('button', { name: 'Konfirmasi lunas' }).click();
	await expect(page.getByText('Dikonfirmasi barusan')).toBeVisible();

	await page.goto('/shop/admin/pesanan', { waitUntil: 'networkidle' });
	await page.getByPlaceholder('Cari kode, nama, nomor, nominal…').fill(orderCode);
	await page.getByRole('link', { name: orderCode }).click();
	await expect(page.getByText('Lunas. Menunggu semua PO')).toBeVisible();
});

test('proses otomatis menutup PO yang lewat deadline dan menyiapkan refund', async ({ page }) => {
	// Mundurkan deadline PO tote bag ke kemarin (simulasi lewat deadline)
	const db = new Database('test-data/shop.db');
	db.prepare(
		`update po_batches set closes_at = ? where product_id = (select id from products where slug = 'tote-bag-kanvas') and status = 'open'`
	).run(Date.now() - 86_400_000);
	db.close();

	await login(page);
	await page.getByRole('button', { name: /Jalankan proses otomatis/ }).click();
	await expect(page.getByText(/1 PO ditutup/)).toBeVisible();

	await page.goto('/shop/produk/tote-bag-kanvas');
	await expect(page.getByText('Target tidak tercapai').first()).toBeVisible();
	await page.goto('/shop/admin/refund', { waitUntil: 'networkidle' });
	await expect(page.getByText('PO tidak mencapai target').first()).toBeVisible();
});

test('admin mengirim pesanan yang PO-nya sudah diproduksi', async ({ page }) => {
	await login(page);
	await page.goto('/shop/admin/pesanan?status=siap-kirim', { waitUntil: 'networkidle' });
	const first = page.locator('a[href^="/shop/admin/pesanan/"]').first();
	await first.click();
	await page.fill('#trackingNo', 'IEX123456789');
	await page.getByRole('button', { name: 'Tandai dikirim' }).click();
	await expect(page.getByText('IEX123456789')).toBeVisible();
});

test('konfigurator tetap jalan dan gaya toko tidak bocor', async ({ page }) => {
	await page.goto('/', { waitUntil: 'networkidle' });
	await expect(page.locator('canvas').first()).toBeVisible();
	const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
	expect(bg).toBe('rgb(232, 236, 238)');
});

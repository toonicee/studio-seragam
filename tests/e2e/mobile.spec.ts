import { expect, test } from '@playwright/test';

test('HP: menu kategori dan tombol pesan menempel di bawah', async ({ page }) => {
	await page.goto('/shop', { waitUntil: 'networkidle' });
	await page.getByRole('button', { name: 'Buka menu' }).click();
	await expect(page.getByRole('dialog').getByRole('link', { name: /Topi & Aksesoris/ })).toBeVisible();
	// Pilihan bahasa ada di menu HP
	await page.getByTestId('sheet-lang-en').click();
	await expect(page.getByRole('dialog').getByRole('link', { name: /Caps & Accessories/ })).toBeVisible();
	await page.getByTestId('sheet-lang-id').click();
	await expect(page.getByRole('dialog').getByRole('link', { name: /Topi & Aksesoris/ })).toBeVisible();
	await page.keyboard.press('Escape');
	await page.goto('/shop/produk/kaos-polo', { waitUntil: 'networkidle' });
	const bar = page.locator('button[form="add-form"]');
	await expect(bar).toBeVisible();
	await page.getByRole('radio', { name: 'L', exact: true }).click();
	await bar.click();
	await expect(page.getByTestId('cart-lines')).toBeVisible();
});

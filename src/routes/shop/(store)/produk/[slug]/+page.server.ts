import { error, fail } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { addLine, readCart, resolveCart, writeCart } from '$lib/server/shop/cart';
import { getProductBySlug, listProducts } from '$lib/server/shop/catalog';
import { MAX_QTY } from '$lib/shop/constants';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const db = getDb();
	const product = getProductBySlug(db, params.slug);
	if (!product) error(404, 'Produk tidak ditemukan');
	const others = listProducts(db).filter((p) => p.id !== product.id);
	const related = [
		...others.filter((p) => p.category.slug === product.category.slug),
		...others.filter((p) => p.category.slug !== product.category.slug)
	].slice(0, 4);
	return { product, related };
};

export const actions: Actions = {
	add: async ({ request, cookies }) => {
		const fd = await request.formData();
		const productId = Number(fd.get('productId'));
		const size = String(fd.get('size') ?? '').trim() || null;
		const qty = Number(fd.get('qty') ?? 1);
		if (!Number.isInteger(productId) || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
			return fail(400, { message: 'Jumlah tidak valid.' });
		}
		// Validasi lewat aturan keranjang: produk aktif, PO dibuka, ukuran tersedia
		const check = resolveCart(getDb(), [{ productId, size, qty }], Date.now()).lines[0];
		if (!check) return fail(404, { message: 'Produk tidak ditemukan.' });
		if (!check.orderable) {
			return fail(400, { message: size === null && check.problem?.startsWith('Ukuran') ? 'Pilih ukuran dulu.' : (check.problem ?? 'Produk belum bisa dipesan.') });
		}
		writeCart(cookies, addLine(readCart(cookies), { productId, size, qty }));
		return { added: { name: check.name, size, qty } };
	}
};

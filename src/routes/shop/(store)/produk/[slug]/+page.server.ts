import { error, fail } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { addLine, readCart, resolveCart, writeCart } from '$lib/server/shop/cart';
import { getProductBySlug, listProducts } from '$lib/server/shop/catalog';
import { getLang } from '$lib/server/shop/lang';
import { MAX_QTY } from '$lib/shop/constants';
import { cartProblemText, translate } from '$lib/shop/i18n';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, cookies }) => {
	const db = getDb();
	const lang = getLang(cookies);
	const product = getProductBySlug(db, params.slug, { lang });
	if (!product) error(404, translate(lang, 'err.productNotFound'));
	const others = listProducts(db, { lang }).filter((p) => p.id !== product.id);
	const related = [
		...others.filter((p) => p.category.slug === product.category.slug),
		...others.filter((p) => p.category.slug !== product.category.slug)
	].slice(0, 4);
	return { product, related };
};

export const actions: Actions = {
	add: async ({ request, cookies }) => {
		const lang = getLang(cookies);
		const fd = await request.formData();
		const productId = Number(fd.get('productId'));
		const size = String(fd.get('size') ?? '').trim() || null;
		const qty = Number(fd.get('qty') ?? 1);
		if (!Number.isInteger(productId) || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
			return fail(400, { message: translate(lang, 'err.qty') });
		}
		// Validasi lewat aturan keranjang: produk aktif, PO dibuka, ukuran tersedia
		const check = resolveCart(getDb(), [{ productId, size, qty }], Date.now(), lang).lines[0];
		if (!check) return fail(404, { message: translate(lang, 'err.productNotFound') });
		if (!check.orderable) {
			const message =
				check.problem === 'size' && size === null
					? translate(lang, 'product.pickSize')
					: check.problem
						? cartProblemText(lang, check.problem, check.batch?.closesAt)
						: translate(lang, 'err.notOrderable');
			return fail(400, { message });
		}
		writeCart(cookies, addLine(readCart(cookies), { productId, size, qty }));
		return { added: { name: check.name, size, qty } };
	}
};

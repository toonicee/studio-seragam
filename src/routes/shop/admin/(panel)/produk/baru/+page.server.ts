import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { getDb } from '$lib/server/db';
import { listCategoriesAdmin, saveProduct } from '$lib/server/shop/admin';
import { requireAdmin } from '$lib/server/shop/guard';
import { ShopError } from '$lib/server/shop/orders';
import { productSchema } from '$lib/shop/schemas';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const categories = listCategoriesAdmin(getDb());
	const form = await superValidate(
		{ categoryId: categories[0]?.id ?? 0, productionDays: 14, active: true, featured: false, sort: 0, price: 0 },
		zod4(productSchema),
		{ errors: false }
	);
	return { form, categories };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await superValidate(request, zod4(productSchema));
		if (!form.valid) return fail(400, { form });
		let id: number;
		try {
			id = saveProduct(getDb(), null, form.data, new Date());
		} catch (e) {
			if (e instanceof ShopError && e.field === 'slug') return setError(form, 'slug', e.message);
			throw e;
		}
		redirect(303, `/shop/admin/produk/${id}?baru=1`);
	}
};

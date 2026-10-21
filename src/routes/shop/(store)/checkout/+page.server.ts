import { fail, redirect } from '@sveltejs/kit';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { getDb } from '$lib/server/db';
import { readCart, writeCart } from '$lib/server/shop/cart';
import { createOrder, ShopError } from '$lib/server/shop/orders';
import { getSettings, listZones } from '$lib/server/shop/settings';
import { normalizePhone } from '$lib/shop/format';
import { checkoutSchema } from '$lib/shop/schemas';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	if (!readCart(cookies).length) redirect(303, '/shop/keranjang');
	const db = getDb();
	const zones = listZones(db);
	const form = await superValidate({ zoneId: zones[0]?.id ?? 0 }, zod4(checkoutSchema), { errors: false });
	return { form, zones, payWindowHours: getSettings(db).payWindowHours };
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await superValidate(request, zod4(checkoutSchema));
		if (!form.valid) return fail(400, { form });

		let token: string;
		try {
			const order = createOrder(
				getDb(),
				{ ...form.data, phone: normalizePhone(form.data.phone)! },
				readCart(cookies),
				new Date()
			);
			token = order.token;
		} catch (e) {
			if (e instanceof ShopError) {
				if (e.field === 'partnerCode' || e.field === 'zoneId') return setError(form, e.field, e.message);
				return message(form, e.message, { status: 400 });
			}
			throw e;
		}
		writeCart(cookies, []);
		redirect(303, `/shop/pesanan/${token}?baru=1`);
	}
};

import { fail, redirect } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { getDb } from '$lib/server/db';
import { findOrderToken } from '$lib/server/shop/orders';
import { normalizePhone } from '$lib/shop/format';
import { lookupSchema } from '$lib/shop/schemas';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	form: await superValidate(zod4(lookupSchema))
});

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(lookupSchema));
		if (!form.valid) return fail(400, { form });
		const token = findOrderToken(getDb(), form.data.code, normalizePhone(form.data.phone)!);
		if (!token) return message(form, 'Pesanan tidak ditemukan. Periksa nomor pesanan dan nomor WhatsApp.', { status: 404 });
		redirect(303, `/shop/pesanan/${token}`);
	}
};

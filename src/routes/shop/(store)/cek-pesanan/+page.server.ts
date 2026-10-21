import { fail, redirect } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { getDb } from '$lib/server/db';
import { getLang } from '$lib/server/shop/lang';
import { findOrderToken } from '$lib/server/shop/orders';
import { normalizePhone } from '$lib/shop/format';
import { translate } from '$lib/shop/i18n';
import { lookupSchemas } from '$lib/shop/schemas';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => ({
	form: await superValidate(zod4(lookupSchemas[getLang(cookies)]))
});

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const lang = getLang(cookies);
		const form = await superValidate(request, zod4(lookupSchemas[lang]));
		if (!form.valid) return fail(400, { form });
		const token = findOrderToken(getDb(), form.data.code, normalizePhone(form.data.phone)!);
		if (!token) return message(form, translate(lang, 'err.lookup'), { status: 404 });
		redirect(303, `/shop/pesanan/${token}`);
	}
};

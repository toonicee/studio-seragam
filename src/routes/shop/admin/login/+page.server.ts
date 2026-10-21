import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { getAuth } from '$lib/server/auth';
import { loginSchema } from '$lib/shop/schemas';
import type { Actions, PageServerLoad } from './$types';

const safeNext = (next: string | null) => (next && next.startsWith('/shop/admin') ? next : '/shop/admin');

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) redirect(303, safeNext(url.searchParams.get('next')));
	return { form: await superValidate({ next: safeNext(url.searchParams.get('next')) }, zod4(loginSchema), { errors: false }) };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(loginSchema));
		if (!form.valid) return fail(400, { form });
		try {
			// Cookie sesi dipasang oleh plugin sveltekitCookies
			await getAuth().api.signInEmail({
				body: { email: form.data.email.trim().toLowerCase(), password: form.data.password },
				headers: request.headers
			});
		} catch (e) {
			if (e instanceof APIError) {
				const tooMany = e.status === 'TOO_MANY_REQUESTS';
				return message(form, tooMany ? 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.' : 'Email atau kata sandi salah.', {
					status: tooMany ? 429 : 400
				});
			}
			throw e;
		}
		redirect(303, safeNext(form.data.next));
	}
};

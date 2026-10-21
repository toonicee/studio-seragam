import { fail } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { listPendingConfirmations } from '$lib/server/shop/admin';
import { requireAdmin } from '$lib/server/shop/guard';
import { confirmPayment, rejectPayment, ShopError } from '$lib/server/shop/orders';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, depends }) => {
	depends('admin:payments');
	return { rows: listPendingConfirmations(getDb()), origin: url.origin };
};

const orderId = (fd: FormData) => Number(fd.get('orderId'));

export const actions: Actions = {
	confirm: async ({ request, locals }) => {
		requireAdmin(locals);
		const id = orderId(await request.formData());
		try {
			confirmPayment(getDb(), id, new Date());
		} catch (e) {
			if (e instanceof ShopError) return fail(400, { message: e.message });
			throw e;
		}
		return { confirmed: id };
	},
	reject: async ({ request, locals }) => {
		requireAdmin(locals);
		const fd = await request.formData();
		const reason = String(fd.get('reason') ?? '').trim();
		if (reason.length < 3) return fail(400, { message: 'Tulis alasan penolakan.' });
		try {
			rejectPayment(getDb(), orderId(fd), reason, new Date());
		} catch (e) {
			if (e instanceof ShopError) return fail(400, { message: e.message });
			throw e;
		}
		return { rejected: orderId(fd) };
	}
};

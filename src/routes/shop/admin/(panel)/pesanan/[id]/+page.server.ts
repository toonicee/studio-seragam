import { error, fail } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { requireAdmin } from '$lib/server/shop/guard';
import {
	cancelOrder,
	confirmPayment,
	getOrderById,
	isReadyToShip,
	markShipped,
	rejectPayment,
	setRefundStatus,
	ShopError
} from '$lib/server/shop/orders';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const order = getOrderById(getDb(), Number(params.id));
	if (!order) error(404, 'Pesanan tidak ditemukan');
	return { order, readyToShip: isReadyToShip(order), statusUrl: `${url.origin}/shop/pesanan/${order.token}` };
};

/** Jalankan aksi admin; kesalahan bisnis jadi pesan, bukan halaman error */
async function run(locals: App.Locals, fn: () => void, ok: string) {
	requireAdmin(locals);
	try {
		fn();
	} catch (e) {
		if (e instanceof ShopError) return fail(400, { message: e.message });
		throw e;
	}
	return { ok };
}

const text = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();

export const actions: Actions = {
	confirm: async ({ params, locals }) => run(locals, () => confirmPayment(getDb(), Number(params.id), new Date()), 'Pembayaran dikonfirmasi'),
	reject: async ({ params, locals, request }) => {
		const reason = text(await request.formData(), 'reason');
		if (reason.length < 3) return fail(400, { message: 'Tulis alasan penolakan.' });
		return run(locals, () => rejectPayment(getDb(), Number(params.id), reason, new Date()), 'Bukti bayar ditolak');
	},
	cancel: async ({ params, locals, request }) => {
		const reason = text(await request.formData(), 'reason');
		if (reason.length < 3) return fail(400, { message: 'Tulis alasan pembatalan.' });
		return run(locals, () => cancelOrder(getDb(), Number(params.id), reason, new Date()), 'Pesanan dibatalkan');
	},
	ship: async ({ params, locals, request }) => {
		const trackingNo = text(await request.formData(), 'trackingNo').toUpperCase();
		if (trackingNo.length < 4) return fail(400, { message: 'Isi nomor resi.' });
		return run(locals, () => markShipped(getDb(), Number(params.id), trackingNo, new Date()), 'Pesanan ditandai dikirim');
	},
	refund: async ({ locals, request }) => {
		const fd = await request.formData();
		const status = text(fd, 'status');
		if (status !== 'done' && status !== 'void' && status !== 'pending') return fail(400, { message: 'Status refund tidak valid.' });
		return run(
			locals,
			() => setRefundStatus(getDb(), Number(fd.get('refundId')), status, { destination: text(fd, 'destination'), note: text(fd, 'note') }, new Date()),
			'Refund diperbarui'
		);
	}
};

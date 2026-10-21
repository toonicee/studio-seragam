import { getDb } from '$lib/server/db';
import { listOrders } from '$lib/server/shop/admin';
import { ORDER_STATUS, type OrderStatus } from '$lib/shop/constants';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const param = url.searchParams.get('status') ?? '';
	const all = listOrders(getDb());
	const filter = param === 'siap-kirim' || (ORDER_STATUS as readonly string[]).includes(param) ? param : '';
	const rows =
		filter === 'siap-kirim'
			? all.filter((o) => o.readyToShip)
			: filter
				? all.filter((o) => o.status === (filter as OrderStatus))
				: all;
	const count = (s: string) => (s === 'siap-kirim' ? all.filter((o) => o.readyToShip).length : all.filter((o) => o.status === s).length);
	return {
		rows,
		filter,
		tabs: [
			{ key: '', label: 'Semua', n: all.length },
			{ key: 'pending_payment', label: 'Menunggu bayar', n: count('pending_payment') },
			{ key: 'pending_confirmation', label: 'Menunggu konfirmasi', n: count('pending_confirmation') },
			{ key: 'paid', label: 'Lunas', n: count('paid') },
			{ key: 'siap-kirim', label: 'Siap kirim', n: count('siap-kirim') },
			{ key: 'shipped', label: 'Dikirim', n: count('shipped') },
			{ key: 'cancelled', label: 'Dibatalkan', n: count('cancelled') }
		]
	};
};

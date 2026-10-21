import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { csvEscape } from '$lib/server/shop/admin';
import { batchOrderLines, getBatch } from '$lib/server/shop/batches';
import { requireAdmin } from '$lib/server/shop/guard';
import type { RequestHandler } from './$types';

/** Rekap pesanan lunas per PO untuk produksi & pengiriman */
export const GET: RequestHandler = async ({ params, locals }) => {
	requireAdmin(locals);
	const db = getDb();
	const batch = getBatch(db, Number(params.id));
	if (!batch) error(404, 'PO tidak ditemukan');
	const header = ['Nomor pesanan', 'Status', 'Nama', 'WhatsApp', 'Kode mitra', 'Ukuran', 'Jumlah', 'Harga', 'Alamat', 'Kota', 'Kode pos'];
	const rows = batchOrderLines(db, batch.id).map((l) => [
		l.code,
		l.status,
		l.customerName,
		l.phone,
		l.partnerCode,
		l.size ?? 'Satu ukuran',
		l.qty,
		l.unitPrice,
		l.address,
		l.city,
		l.postalCode
	]);
	// BOM supaya Excel membaca UTF-8
	const csv = '﻿' + [header, ...rows].map((r) => r.map(csvEscape).join(',')).join('\r\n');
	const name = `rekap-${batch.productSlug}-batch${batch.batchNo}.csv`;
	return new Response(csv, {
		headers: {
			'content-type': 'text/csv; charset=utf-8',
			'content-disposition': `attachment; filename="${name}"`
		}
	});
};

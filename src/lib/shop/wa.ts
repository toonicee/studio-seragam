/** Link WhatsApp (wa.me) dengan pesan siap kirim — tanpa layanan berbayar */
import { fmtDay, rupiah } from './format';

export const waLink = (phone: string, text: string) =>
	`https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

type OrderLike = { code: string; customerName: string; total: number };

export const waText = {
	/** Pembeli → admin */
	askAdmin: (o?: OrderLike, statusUrl?: string) =>
		o
			? `Halo admin Toko Indah Expres, saya ${o.customerName} dengan pesanan ${o.code}.${statusUrl ? `\nStatus: ${statusUrl}` : ''}\n\n`
			: 'Halo admin Toko Indah Expres, saya mau bertanya tentang merchandise PO.\n\n',

	/** Admin → pembeli */
	paid: (o: OrderLike, statusUrl: string) =>
		`Halo ${o.customerName}, pembayaran pesanan ${o.code} sebesar ${rupiah(o.total)} sudah kami terima. Terima kasih!\n\nPantau progres PO di: ${statusUrl}`,

	rejected: (o: OrderLike, reason: string, statusUrl: string) =>
		`Halo ${o.customerName}, bukti bayar pesanan ${o.code} belum bisa kami konfirmasi: ${reason}\n\nMohon bayar tepat ${rupiah(o.total)} lalu unggah ulang bukti di: ${statusUrl}`,

	refund: (o: OrderLike, amount: number, reason: string) =>
		`Halo ${o.customerName}, mohon maaf, untuk pesanan ${o.code}: ${reason}. Dana ${rupiah(amount)} akan kami kembalikan 100%.\n\nMohon balas dengan tujuan refund: GoPay (nomor) atau rekening bank (bank, nomor, nama pemilik).`,

	refundDone: (o: OrderLike, amount: number) =>
		`Halo ${o.customerName}, refund ${rupiah(amount)} untuk pesanan ${o.code} sudah kami transfer. Terima kasih atas pengertiannya.`,

	shipped: (o: OrderLike, trackingNo: string, statusUrl: string) =>
		`Halo ${o.customerName}, pesanan ${o.code} sudah dikirim lewat Indah Expres dengan nomor resi ${trackingNo}.\n\nDetail: ${statusUrl}`,

	reminder: (o: OrderLike & { payBy: number }, statusUrl: string) =>
		`Halo ${o.customerName}, pesanan ${o.code} menunggu pembayaran ${rupiah(o.total)} paling lambat ${fmtDay(o.payBy)}. Bayar & unggah bukti di: ${statusUrl}`
};

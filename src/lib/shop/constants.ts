/** Nilai tetap toko yang dipakai server (skema DB) dan halaman. Tanpa import server. */

export const PO_STATUS = ['open', 'production', 'done', 'failed'] as const;
export const ORDER_STATUS = [
	'pending_payment',
	'pending_confirmation',
	'paid',
	'shipped',
	'cancelled'
] as const;
export const REFUND_REASON = ['po_failed', 'cancelled', 'unconfirmed'] as const;
export const REFUND_STATUS = ['pending', 'done', 'void'] as const;

export type PoStatus = (typeof PO_STATUS)[number];
export type OrderStatus = (typeof ORDER_STATUS)[number];
export type RefundReason = (typeof REFUND_REASON)[number];
export type RefundStatus = (typeof REFUND_STATUS)[number];

/**
 * Foto produk. `placeholder` = gambar sementara sampai foto asli diunggah admin;
 * `zoom` = perbesar sedikit untuk memotong tepi foto yang kurang rapi
 */
export type ProductImage = { src: string; alt: string; placeholder?: boolean; zoom?: number };
/** Baris tabel ukuran dalam cm (panjang badan × lebar dada) */
export type SizeRow = { size: string; length: number | null; width: number | null };

/** Halaman info yang bisa diubah admin */
export const INFO_PAGES = [
	{ slug: 'cara-kerja-po', title: 'Cara Kerja PO' },
	{ slug: 'faq', title: 'FAQ' },
	{ slug: 'kebijakan-refund', title: 'Kebijakan Refund' },
	{ slug: 'kontak', title: 'Kontak' }
] as const;

/** Batas jumlah per item di keranjang */
export const MAX_QTY = 99;
/** PO dianggap "segera ditutup" bila sisa waktu kurang dari ini */
export const CLOSING_SOON_MS = 48 * 3600_000;

/** Label & warna status pesanan dan refund untuk pembeli dan admin */
import type { OrderStatus, RefundReason, RefundStatus } from './constants';
import type { Tone } from './po';

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; tone: Tone; hint: string }> = {
	pending_payment: {
		label: 'Menunggu pembayaran',
		tone: 'warning',
		hint: 'Bayar lewat QRIS dengan nominal persis, lalu unggah bukti bayar.'
	},
	pending_confirmation: {
		label: 'Menunggu konfirmasi',
		tone: 'brand',
		hint: 'Bukti bayar sudah diterima. Admin mencocokkan pembayaran di GoPay Merchant.'
	},
	paid: {
		label: 'Lunas',
		tone: 'success',
		hint: 'Pembayaran dikonfirmasi. Pesanan ikut dihitung di progres PO.'
	},
	shipped: {
		label: 'Dikirim',
		tone: 'ink',
		hint: 'Pesanan sudah dikirim lewat Indah Expres.'
	},
	cancelled: {
		label: 'Dibatalkan',
		tone: 'danger',
		hint: 'Pesanan dibatalkan.'
	}
};

export const REFUND_REASON_LABEL: Record<RefundReason, string> = {
	po_failed: 'PO tidak mencapai target',
	cancelled: 'Pesanan dibatalkan',
	unconfirmed: 'Pembayaran belum dikonfirmasi saat PO ditutup'
};

export const REFUND_STATUS_META: Record<RefundStatus, { label: string; tone: Tone }> = {
	pending: { label: 'Menunggu refund', tone: 'warning' },
	done: { label: 'Sudah direfund', tone: 'success' },
	void: { label: 'Tidak perlu refund', tone: 'muted' }
};

/** Kelas badge per warna (Tailwind) */
export const TONE_CLASS: Record<Tone, string> = {
	brand: 'bg-brand text-white',
	success: 'bg-success text-white',
	warning: 'bg-warning-soft text-warning ring-1 ring-inset ring-warning/25',
	muted: 'bg-muted text-muted-foreground ring-1 ring-inset ring-border',
	danger: 'bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/25',
	ink: 'bg-ink text-white'
};

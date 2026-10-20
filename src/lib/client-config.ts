/**
 * CLIENT CONFIGURATION — Indah Express
 * Warna, logo, dan branding dikunci untuk klien ini.
 * Untuk mengganti klien, ubah nilai di file ini saja.
 */

export const CLIENT_CONFIG = {
	/** Nama klien */
	name: 'Indah Expres',
	/** Tagline di header */
	tagline: 'Seragam Resmi Indah Expres',
	/** Warna dasar badan kemeja (putih) */
	bodyColor: '#f6f6f2',
	/** Warna aksen (orange brand Indah Express) */
	accentColor: '#e35a12',
	/** Warna button/kancing — senada aksen */
	buttonColor: 'accent' as const,
	/** Warna teks bordir default */
	inkColor: '#e35a12',
	/** Apakah warna dikunci (tidak bisa diubah user) */
	lockColors: false,
	/** Logo resmi untuk bordir dada kiri (PNG transparan, panah sudah diisi putih) */
	logoUrl: '/brand/indah-expres.png',
	/** Logo versi teks terang untuk tampilan mode gelap */
	logoDarkUrl: '/brand/indah-expres-dark.png',
	/** Ikon bulat saja (header, favicon) */
	markUrl: '/brand/indah-expres-mark.png',
	/** Slot logo yang auto-preload */
	defaultLogoSlot: 'dadaKiri' as const,
	/** Apakah logo bisa dihapus user */
	lockLogo: true,
	/** Teks display di brand header */
	brandTitle: 'Studio Seragam',
	/** Subtitle kustom */
	brandSubtitle: 'Indah Expres × Studio Seragam',
	/** Warna aksen untuk UI/accent brand */
	brandOrange: '#E35A12',
	/** Label order di WhatsApp */
	waLabel: 'ORDER SERAGAM – INDAH EXPRES',
	/** Nomor WhatsApp admin (format 62…) — masih placeholder, ganti dengan nomor asli */
	waNumber: '6281200000000'
} as const;

/** Warna yang diizinkan untuk UI (read-only display, tidak bisa dipilih user) */
export const LOCKED_COLORS = {
	body: CLIENT_CONFIG.bodyColor,
	accent: CLIENT_CONFIG.accentColor
} as const;

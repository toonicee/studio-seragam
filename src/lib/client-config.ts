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
	/** Warna body (putih) — LOCKED */
	bodyColor: '#FFFFFF',
	/** Warna aksen (orange brand Indah Express) — LOCKED */
	accentColor: '#E35A12',
	/** Warna button/kancing — senada aksen */
	buttonColor: 'accent' as const,
	/** Warna teks bordir default */
	inkColor: '#E35A12',
	/** Apakah warna dikunci (tidak bisa diubah user) */
	lockColors: true,
	/** Base64 SVG logo Indah Express untuk dada kiri */
	logoBase64: indahExpresLogoSvgBase64(),
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
	waLabel: 'ORDER SERAGAM – INDAH EXPRES'
} as const;

/**
 * SVG logo Indah Express sebagai data URI base64
 * (inline agar tidak perlu fetch network)
 */
function indahExpresLogoSvgBase64(): string {
	// SVG representasi logo Indah Express: lingkaran orange + panah kanan putih
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" width="120" height="40">
  <rect width="120" height="40" rx="4" fill="none"/>
  <!-- Ikon panah lingkaran orange -->
  <circle cx="20" cy="20" r="18" fill="#E35A12"/>
  <path d="M9 20 L25 20 M19 13 L26 20 L19 27" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <!-- Teks INDAH -->
  <text x="44" y="17" font-family="Arial Black, sans-serif" font-size="13" font-weight="900" fill="#1a1a1a" letter-spacing="0.5">INDAH</text>
  <!-- Teks EXPRES -->
  <text x="44" y="31" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#E35A12" letter-spacing="1.5">EXPRES</text>
</svg>`;
	// Encode ke base64 data URI
	const b64 = btoa(unescape(encodeURIComponent(svg)));
	return `data:image/svg+xml;base64,${b64}`;
}

/** Warna yang diizinkan untuk UI (read-only display, tidak bisa dipilih user) */
export const LOCKED_COLORS = {
	body: CLIENT_CONFIG.bodyColor,
	accent: CLIENT_CONFIG.accentColor
} as const;

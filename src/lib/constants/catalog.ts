import type {
	ProductConfig,
	ProductKey,
	SlotDefinition,
	SlotKey,
	PatternItem,
	UniformState
} from '$lib/types/uniform';

export const TAMPILKAN_HARGA = true;

export const HARGA: Record<string, Record<string, [number, number] | null>> = {
	kemeja: { unione: [158600, 130900], am1919: [164900, 135900] },
	kemejaPanjang: { unione: [185400, 152300], am1919: [193800, 159000] },
	kaos: { drifit: [86400, 72000], combed: [78000, 65000] },
	polo: { pique: [90000, 75000] },
	rompi: { taslan: null, drill: null, ripstop: null }
};

export const MIN_ORDER: Record<string, number | null> = {
	kemeja: 36,
	kemejaPanjang: 36,
	kaos: 1,
	polo: 1,
	rompi: null
};

const SIZES_KEMEJA: [string, number | null, number | null][] = [
	['XS', 63, 46],
	['S', 66, 49],
	['M', 69, 52],
	['L', 72, 55],
	['XL', 75, 58],
	['2XL', 78, 61],
	['3XL', 78, 64],
	['4XL', 78, 67]
];

const KEMEJA_INCL = [
	'Kerah kemeja standar',
	'2 saku tempel + tutup saku + ploi saku',
	'2 bordir logo dada kanan–kiri + 1 punggung',
	'Variasi 2 warna seperti desain'
];

export const PRODUCTS: Record<ProductKey, ProductConfig> = {
	kemeja: {
		name: 'Kemeja Lengan Pendek',
		sleeve: 'short',
		collar: 'shirt',
		placket: 'full',
		pockets: true,
		buttons: true,
		finish: 'bordir',
		materials: [
			{ id: 'unione', name: 'Unione American', list: 158600, promo: 130900, weave: 'drill' },
			{ id: 'am1919', name: 'American 1919', list: 164900, promo: 135900, weave: 'drill' }
		],
		minOrder: 36,
		includes: KEMEJA_INCL,
		sizes: SIZES_KEMEJA,
		slots: ['dadaKiri', 'dadaKanan', 'punggung'],
		ease: 10
	},
	kemejaPanjang: {
		name: 'Kemeja Lengan Panjang',
		sleeve: 'long',
		collar: 'shirt',
		placket: 'full',
		pockets: true,
		buttons: true,
		finish: 'bordir',
		materials: [
			{ id: 'unione', name: 'Unione American', list: 185400, promo: 152300, weave: 'drill' },
			{ id: 'am1919', name: 'American 1919', list: 193800, promo: 159000, weave: 'drill' }
		],
		minOrder: 36,
		includes: KEMEJA_INCL,
		sizes: SIZES_KEMEJA,
		slots: ['dadaKiri', 'dadaKanan', 'punggung'],
		ease: 10
	},
	kaos: {
		name: 'Kaos',
		sleeve: 'tee',
		collar: 'crew',
		placket: 'none',
		pockets: false,
		buttons: false,
		finish: 'sablon',
		materials: [
			{ id: 'drifit', name: 'Dri-Fit 2720', list: 86400, promo: 72000, weave: 'mesh' },
			{ id: 'combed', name: 'Cotton Combed 30s', list: 78000, promo: 65000, weave: 'jersey' }
		],
		minOrder: 1,
		includes: ['Sablon DTF depan & belakang'],
		sizes: [
			['S', 63, 44],
			['M', 67, 47],
			['L', 68, 49],
			['XL', 71, 51],
			['2XL', 73, 54],
			['3XL', 76, 57]
		],
		slots: ['dadaKiri', 'depan', 'punggung'],
		ease: 6
	},
	polo: {
		name: 'Kaos Polo',
		sleeve: 'polo',
		collar: 'polo',
		placket: 'polo',
		pockets: false,
		buttons: true,
		finish: 'bordir',
		materials: [{ id: 'pique', name: 'Lacoste Pique', list: 90000, promo: 75000, weave: 'pique' }],
		minOrder: 1,
		includes: ['Bordir depan & belakang'],
		sizes: [
			['S', 62, 43],
			['M', 67, 48],
			['L', 70, 50],
			['XL', 74, 52],
			['2XL', 76, 56]
		],
		slots: ['dadaKiri', 'punggung'],
		ease: 6
	},
	rompi: {
		name: 'Rompi',
		sleeve: 'none',
		collar: 'stand',
		placket: 'zip',
		pockets: false,
		cargo: true,
		buttons: false,
		finish: 'bordir',
		noPrice: true,
		materials: [
			{ id: 'taslan', name: 'Taslan', list: null, promo: null, weave: 'taslan' },
			{ id: 'drill', name: 'Drill', list: null, promo: null, weave: 'drill' },
			{ id: 'ripstop', name: 'Ripstop', list: null, promo: null, weave: 'ripstop' }
		],
		minOrder: null,
		includes: [],
		sizes: [
			['S', null, null],
			['M', null, null],
			['L', null, null],
			['XL', null, null],
			['2XL', null, null],
			['3XL', null, null]
		],
		slots: ['dadaKiri', 'dadaKanan', 'punggung'],
		ease: 10,
		frontSlotY: 0.3,
		note: 'Rompi belum ada di katalog standar 2025. Harga, minimal order, dan ukuran cm menyusul dari admin.'
	}
};

export const ORDER: ProductKey[] = ['kemeja', 'kemejaPanjang', 'kaos', 'polo', 'rompi'];

export const WEAVE_LABEL: Record<string, string> = {
	drill: 'Kain drill, anyaman twill kuat',
	jersey: 'Katun rajut jersey adem',
	mesh: 'Rajut dry-fit menyerap keringat',
	pique: 'Rajut lacoste berpori',
	taslan: 'Kain taslan, permukaan halus anti percik',
	ripstop: 'Anyaman kotak ripstop tahan sobek'
};

export const SLOT_DEFS: Record<SlotKey, SlotDefinition> = {
	dadaKiri: {
		label: 'Dada kiri',
		hint: 'Kiri pemakai, di atas saku',
		side: 'front',
		s: 0.18,
		y: 0.378,
		logoH: 0.058,
		textH: 0.028,
		maxW: 0.19
	},
	dadaKanan: {
		label: 'Dada kanan',
		hint: 'Kanan pemakai, biasanya untuk nama',
		side: 'front',
		s: -0.18,
		y: 0.378,
		logoH: 0.058,
		textH: 0.028,
		maxW: 0.19
	},
	depan: {
		label: 'Depan tengah',
		hint: 'Area cetak lebar di dada atas',
		side: 'front',
		s: 0,
		y: 0.29,
		logoH: 0.13,
		textH: 0.045,
		maxW: 0.46
	},
	punggung: {
		label: 'Punggung',
		hint: 'Logo, teks, lalu gambar tambahan',
		side: 'back',
		s: 0,
		y: 0.3,
		logoH: 0.12,
		textH: 0.042,
		maxW: 0.5,
		extraH: 0.05,
		multi: true
	}
};

export const SWATCHES: [name: string, hex: string][] = [
	['Putih', '#f6f6f2'],
	['Hitam', '#1c1d20'],
	['Navy', '#1f2c4c'],
	['Biru Benhur', '#2b5aa8'],
	['Biru Muda', '#86b6de'],
	['Abu Muda', '#c8ccce'],
	['Abu Tua', '#5a5f66'],
	['Charcoal', '#45484d'],
	['Krem', '#efece2'],
	['Merah', '#c42f2f'],
	['Maroon', '#6c1f2a'],
	['Oranye', '#e8641e'],
	['Kuning', '#f0c032'],
	['Hijau Army', '#4e5a36'],
	['Hijau Botol', '#1d5a45'],
	['Tosca', '#1c9893'],
	['Khaki', '#b8a27b'],
	['Cokelat', '#6b4a33']
];

export const THREADS: [name: string, hex: string][] = [
	['Otomatis', 'auto'],
	['Putih', '#f4f4f0'],
	['Hitam', '#16171a'],
	['Navy', '#1f2c4c'],
	['Merah', '#c42f2f'],
	['Oranye', '#e8641e'],
	['Emas', '#d4a020'],
	['Biru', '#2b5aa8'],
	['Abu', '#8a9097']
];

export const BUTTONS: [name: string, hex: string][] = [
	['Otomatis', 'auto'],
	['Putih', '#f2f2ee'],
	['Hitam', '#1a1b1e'],
	['Warna aksen', 'accent']
];

export const SILVER = '#c4c9ce';

export const PATTERN_GROUPS = [
	['dasar', 'Dasar & katalog'],
	['sport', 'Panel & sport'],
	['logistik', 'Logistik & safety']
] as const;

export const VEST_GROUPS = [['rompi', 'Pola rompi']] as const;

export const PATTERNS: PatternItem[] = [
	{ id: 'polos', group: 'dasar', name: 'Polos', desc: 'Satu warna penuh', sleeve: 0, trim: 0, pocket: 0 },
	{ id: 'lengan', group: 'dasar', name: 'Lengan kontras', desc: 'Seperti katalog: lengan, kerah, saku', sleeve: 1, trim: 1, pocket: 1, catalog: true },
	{ id: 'kerahSaku', group: 'dasar', name: 'Kerah & saku', desc: 'Lengan tetap warna badan', sleeve: 0, trim: 1, pocket: 1 },
	{ id: 'plaket', group: 'dasar', name: 'Plaket kontras', desc: 'Plaket kancing, kerah, tutup saku', sleeve: 0, trim: 1, pocket: 0, placket: 1 },
	{ id: 'sport3', group: 'sport', name: 'Raglan + list', desc: '3 warna: pundak lengkung, list, sisi', sleeve: 1, trim: 0, pocket: 0, body: 'sport3', c3: true },
	{ id: 'sport2', group: 'sport', name: 'Pundak & sisi lengkung', desc: '2 warna: pundak-lengan atas, sisi', sleeve: 0, trim: 0, pocket: 0, body: 'sport2', sleeveSplit: true },
	{ id: 'sisiLengkung', group: 'sport', name: 'Sisi lengkung', desc: 'Panel sisi melebar ke bawah', sleeve: 1, trim: 1, pocket: 0, body: 'sideCurve' },
	{ id: 'yoke', group: 'sport', name: 'Pundak + lengan', desc: 'Panel pundak, lengan, saku', sleeve: 1, trim: 1, pocket: 1, body: 'yoke' },
	{ id: 'pundak', group: 'sport', name: 'Pundak saja', desc: 'Panel pundak, lengan polos', sleeve: 0, trim: 1, pocket: 0, body: 'yoke' },
	{ id: 'raglan', group: 'sport', name: 'Raglan', desc: 'Potongan miring leher ke ketiak', sleeve: 1, trim: 1, pocket: 0, body: 'raglan' },
	{ id: 'samping', group: 'sport', name: 'Panel samping', desc: 'Sisi badan lurus, kerah, saku', sleeve: 0, trim: 1, pocket: 1, body: 'side' },
	{ id: 'atasBawah', group: 'sport', name: 'Atas-bawah', desc: 'Badan atas & lengan warna aksen', sleeve: 1, trim: 1, pocket: 1, body: 'upper' },
	{ id: 'bawah', group: 'sport', name: 'Bawah kontras', desc: 'Badan bawah warna aksen', sleeve: 0, trim: 1, pocket: 0, body: 'bottom' },
	{ id: 'list', group: 'logistik', name: 'List dada', desc: 'Garis melintang dada & lengan', sleeve: 0, trim: 1, pocket: 0, body: 'stripe', sleeveStripe: 'accent' },
	{ id: 'listLengan', group: 'logistik', name: 'List lengan ganda', desc: 'Dua garis tipis di lengan', sleeve: 0, trim: 1, pocket: 1, sleeveStripe: 'double' },
	{ id: 'piping', group: 'logistik', name: 'Piping', desc: 'Garis tipis di pundak, saku, plaket', sleeve: 0, trim: 1, pocket: 0, body: 'piping', sleeveStripe: 'pipe' },
	{ id: 'reflektor', group: 'logistik', name: 'Lengan + reflektor', desc: 'Pita reflektif dada, pinggang, lengan', sleeve: 1, trim: 1, pocket: 1, body: 'reflect', sleeveStripe: 'reflect', extra: true },
	{ id: 'atasReflektor', group: 'logistik', name: 'Atas-bawah + reflektor', desc: 'Dua warna dipisah pita reflektif', sleeve: 1, trim: 1, pocket: 1, body: 'upperReflect', sleeveStripe: 'reflect', extra: true },
	{ id: 'rompi', group: 'logistik', name: 'Rompi reflektif', desc: 'Pita tegak bahu–pinggang + lingkar', sleeve: 1, trim: 1, pocket: 1, body: 'vest', sleeveStripe: 'reflect', extra: true },
	// khusus model rompi
	{ id: 'vestRefleks', group: 'rompi', vestOnly: true, name: 'List reflektif dada', desc: 'Seperti contoh: 2 list di dada atas', trim: 0, pocket: 0, body: 'chestStrips' },
	{ id: 'vestRefleksPenuh', group: 'rompi', vestOnly: true, name: 'Reflektif dada + pinggang', desc: 'List dada dan lingkar bawah', trim: 0, pocket: 0, body: 'chestStripsWaist' },
	{ id: 'vestSafety', group: 'rompi', vestOnly: true, name: 'Rompi safety', desc: 'Pita tegak bahu–bawah + lingkar', trim: 0, pocket: 0, body: 'vest' },
	{ id: 'vestPundak', group: 'rompi', vestOnly: true, name: 'Pundak kontras', desc: 'Pundak, kerah, lis lengan aksen', trim: 1, pocket: 0, body: 'yoke' },
	{ id: 'vestSisi', group: 'rompi', vestOnly: true, name: 'Sisi kontras', desc: 'Sisi lengkung, saku, lis aksen', trim: 1, pocket: 1, body: 'sideCurve' },
	{ id: 'vestAtasBawah', group: 'rompi', vestOnly: true, name: 'Atas-bawah', desc: 'Badan atas & kerah warna aksen', trim: 1, pocket: 0, body: 'upper' }
];

export const patternsFor = (pid: ProductKey, group?: string) =>
	PATTERNS.filter(p =>
		PRODUCTS[pid].sleeve === 'none'
			? (p.vestOnly || p.id === 'polos') && (!group || group === 'rompi')
			: !p.vestOnly && (!group || p.group === group)
	);

export const patternOf = (id: string) => PATTERNS.find(p => p.id === id) || PATTERNS[0];

export const SAMPLE_LOOKS: Record<string, Partial<{ body: string; accent: string; accent2: string; lining: string }>> = {
	sport3: { body: '#1c1d20', accent: '#45484d', accent2: '#c8ccce' },
	sport2: { body: '#efece2', accent: '#1f2c4c' },
	vestRefleks: { body: '#1f2c4c', lining: '#1c1d20' }
};

export const FONTS: Record<string, { label: string; css: (px: number) => string }> = {
	tegas: {
		label: 'Tegas',
		css: px => `700 ${px}px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`
	},
	klasik: {
		label: 'Klasik',
		css: px => `700 ${px}px "Roboto Slab", Georgia, serif`
	},
	sambung: {
		label: 'Sambung',
		css: px => `700 ${px}px "Dancing Script", "Brush Script MT", cursive`
	}
};

export const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];

export const WEIGHT_GUIDE: Record<string, [number, number]> = {
	XS: [0, 45],
	S: [45, 55],
	M: [55, 65],
	L: [65, 75],
	XL: [75, 85],
	'2XL': [85, 95],
	'3XL': [95, 105],
	'4XL': [105, 118]
};

export const DEFAULT_STATE: UniformState = {
	product: 'kemeja',
	material: {
		kemeja: 'unione',
		kemejaPanjang: 'unione',
		kaos: 'combed',
		polo: 'pique',
		rompi: 'taslan'
	},
	look: {
		// INDAH EXPRESS: putih body + orange aksen — DIKUNCI oleh client-config
		kemeja: { pattern: 'lengan', body: '#FFFFFF', accent: '#E35A12', accent2: '#c8ccce', button: 'accent' },
		kemejaPanjang: { pattern: 'lengan', body: '#FFFFFF', accent: '#E35A12', accent2: '#c8ccce', button: 'accent' },
		kaos: { pattern: 'polos', body: '#FFFFFF', accent: '#E35A12', accent2: '#c8ccce', button: 'auto' },
		polo: { pattern: 'polos', body: '#FFFFFF', accent: '#E35A12', accent2: '#c8ccce', button: 'accent' },
		rompi: {
			pattern: 'vestRefleks',
			body: '#FFFFFF',
			accent: '#E35A12',
			accent2: '#c8ccce',
			button: 'auto',
			lining: '#E35A12'
		}
	},
	logoSrc: null,
	removeWhite: true,
	slotOn: {
		kemeja: { dadaKiri: true, dadaKanan: true, depan: false, punggung: true },
		kemejaPanjang: { dadaKiri: true, dadaKanan: true, depan: false, punggung: true },
		kaos: { dadaKiri: false, dadaKanan: false, depan: true, punggung: true },
		polo: { dadaKiri: true, dadaKanan: false, depan: false, punggung: true },
		rompi: { dadaKiri: true, dadaKanan: true, depan: false, punggung: true }
	},
	slots: {
		dadaKiri: { logo: true, text: '', font: 'tegas', color: 'auto', size: 1, dy: 0 },
		dadaKanan: { logo: false, text: 'Agung Prabowo', font: 'tegas', color: 'auto', size: 1, dy: 0 },
		depan: { logo: true, text: '', font: 'tegas', color: 'auto', size: 1, dy: 0 },
		punggung: { logo: true, text: 'www.indahexpres.com', font: 'tegas', color: 'auto', size: 1, dy: 0, extraSrc: null }
	},
	measureOn: false,
	sleeveStyle: 'panjang',
	pocketCount: { kemeja: 2, kemejaPanjang: 2, kaos: 0, polo: 0, rompi: 0 },
	vestFlag: true,
	qty: {
		kemeja: { S: 6, M: 12, L: 10, XL: 6, '2XL': 2 },
		kemejaPanjang: { S: 6, M: 12, L: 10, XL: 6, '2XL': 2 },
		kaos: { S: 4, M: 8, L: 8, XL: 4 },
		polo: { M: 6, L: 6, XL: 3 },
		rompi: { M: 4, L: 6, XL: 2 }
	},
	customer: { name: '', org: '', phone: '', email: '', note: '' },
	chest: '',
	weight: '',
	height: ''
};

export const STORE_KEY = 'studio-seragam-v4';

/* ---------- Color Math Helpers ---------- */
export const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (e0: number, e1: number, x: number) => {
	const t = clamp((x - e0) / (e1 - e0), 0, 1);
	return t * t * (3 - 2 * t);
};
export const TAU = Math.PI * 2;
export const DEG = Math.PI / 180;

export const fmt = (n: number | null | undefined) => (n == null ? 'Rp0' : 'Rp' + Math.round(n).toLocaleString('id-ID'));
export const esc = (s: string | null | undefined) =>
	String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c));

export function hexToRgb(h: string): [number, number, number] {
	h = h.replace('#', '');
	if (h.length === 3) h = h.split('').map(c => c + c).join('');
	const n = parseInt(h, 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(c: [number, number, number]): string {
	return '#' + c.map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
}

export function mix(a: string, b: string, t: number): string {
	const x = hexToRgb(a),
		y = hexToRgb(b);
	return rgbToHex(x.map((v, i) => lerp(v, y[i], t)) as [number, number, number]);
}

export function lum(h: string): number {
	const [r, g, b] = hexToRgb(h).map(v => {
		v /= 255;
		return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export const stitchOf = (h: string) => (lum(h) < 0.18 ? mix(h, '#ffffff', 0.2) : mix(h, '#000000', 0.2));
export const autoInk = (bg: string) => (lum(bg) > 0.33 ? '#1b2129' : '#f4f4f0');

export function colorName(hex: string): string {
	const all = [...SWATCHES, ...THREADS, ...BUTTONS];
	const f = all.find(([, h]) => h.toLowerCase() === String(hex).toLowerCase());
	return f ? f[0] : String(hex).toUpperCase();
}

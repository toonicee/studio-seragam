/** Validasi form toko & admin (Zod) — dipakai Superforms di server dan browser */
import { z } from 'zod';
import { INFO_PAGES } from './constants';
import { normalizePhone } from './format';
import { translate, type Lang } from './i18n';

const phoneFor = (lang: Lang) =>
	z
		.string()
		.trim()
		.min(1, translate(lang, 'val.phoneEmpty'))
		.refine((v) => normalizePhone(v) !== null, translate(lang, 'val.phone'));

const phone = phoneFor('id');

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pilih tanggal');

function makeCheckoutSchema(lang: Lang) {
	const m = (k: Parameters<typeof translate>[1]) => translate(lang, k);
	return z.object({
		partnerCode: z
			.string()
			.trim()
			.min(2, m('val.partnerCode'))
			.max(32)
			.transform((v) => v.toUpperCase()),
		phone: phoneFor(lang),
		name: z.string().trim().min(2, m('val.name')).max(80),
		email: z
			.string()
			.trim()
			.max(120)
			.refine((v) => v === '' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), m('val.email')),
		address: z.string().trim().min(8, m('val.address')).max(300),
		city: z.string().trim().min(2, m('val.city')).max(80),
		postalCode: z
			.string()
			.trim()
			.refine((v) => v === '' || /^\d{5}$/.test(v), m('val.postal')),
		zoneId: z.number().int().positive(m('val.zone')),
		note: z.string().trim().max(300)
	});
}

function makeLookupSchema(lang: Lang) {
	return z.object({
		code: z
			.string()
			.trim()
			.min(4, translate(lang, 'val.orderCode'))
			.transform((v) => v.toUpperCase()),
		phone: phoneFor(lang)
	});
}

/** Skema per bahasa (pesan validasi mengikuti bahasa toko) */
export const checkoutSchemas = { id: makeCheckoutSchema('id'), en: makeCheckoutSchema('en') };
export const lookupSchemas = { id: makeLookupSchema('id'), en: makeLookupSchema('en') };
export const checkoutSchema = checkoutSchemas.id;
export const lookupSchema = lookupSchemas.id;

// ── Admin ──

export const loginSchema = z.object({
	email: z.string().trim().min(3, 'Isi email'),
	password: z.string().min(1, 'Isi kata sandi'),
	next: z.string()
});

export const passwordSchema = z
	.object({
		currentPassword: z.string().min(1, 'Isi kata sandi sekarang'),
		newPassword: z.string().min(8, 'Minimal 8 karakter'),
		confirmPassword: z.string()
	})
	.refine((v) => v.newPassword === v.confirmPassword, {
		message: 'Konfirmasi tidak sama',
		path: ['confirmPassword']
	});

export const productSchema = z.object({
	name: z.string().trim().min(2, 'Isi nama produk').max(120),
	slug: z
		.string()
		.trim()
		.max(80)
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Huruf kecil, angka, dan tanda hubung saja'),
	categoryId: z.number().int().positive('Pilih kategori'),
	summary: z.string().trim().max(200),
	description: z.string().trim().max(4000),
	details: z.string().trim().max(4000),
	nameEn: z.string().trim().max(120),
	summaryEn: z.string().trim().max(200),
	descriptionEn: z.string().trim().max(4000),
	detailsEn: z.string().trim().max(4000),
	price: z.number().int().min(0, 'Harga tidak valid').max(100_000_000),
	/** "S, M, L, XL" — kosong = satu ukuran */
	sizes: z.string().trim().max(200),
	/** Satu baris per ukuran: "M 69 52" (panjang, lebar dalam cm) */
	sizeChart: z.string().trim().max(2000),
	productionDays: z.number().int().min(1, 'Minimal 1 hari').max(365),
	active: z.boolean().default(true),
	featured: z.boolean().default(false),
	sort: z.number().int().min(0).max(9999)
});

export const batchSchema = z.object({
	target: z.number().int().min(1, 'Minimal 1 pcs').max(1_000_000),
	closeDate: dateString,
	productionDays: z.number().int().min(1, 'Minimal 1 hari').max(365)
});

export const partnerSchema = z.object({
	id: z.number().int().min(0),
	code: z
		.string()
		.trim()
		.min(2, 'Isi kode mitra')
		.max(32)
		.regex(/^[A-Za-z0-9-]+$/, 'Huruf, angka, dan tanda hubung saja')
		.transform((v) => v.toUpperCase()),
	name: z.string().trim().min(2, 'Isi nama mitra').max(120),
	phone,
	city: z.string().trim().max(80),
	active: z.boolean().default(true)
});

export const settingsSchema = z.object({
	merchantName: z.string().trim().min(2, 'Isi nama merchant').max(80),
	waAdmin: phone,
	payWindowHours: z.number().int().min(1, 'Minimal 1 jam').max(168, 'Maksimal 7 hari')
});

export const zoneSchema = z.object({
	id: z.number().int().min(0),
	name: z.string().trim().min(2, 'Isi nama tarif').max(80),
	fee: z.number().int().min(0).max(10_000_000),
	active: z.boolean().default(true)
});

const pageSlugs = INFO_PAGES.map((p) => p.slug) as [string, ...string[]];

export const pageSchema = z.object({
	slug: z.enum(pageSlugs),
	title: z.string().trim().min(2).max(80),
	body: z.string().max(20000),
	titleEn: z.string().trim().max(80),
	bodyEn: z.string().max(20000)
});

export const rejectSchema = z.object({
	reason: z.string().trim().min(3, 'Tulis alasan singkat').max(200)
});

export const shipSchema = z.object({
	trackingNo: z.string().trim().min(4, 'Isi nomor resi').max(40)
});

export const cancelSchema = z.object({
	reason: z.string().trim().min(3, 'Tulis alasan singkat').max(200)
});

export const refundSchema = z.object({
	destination: z.string().trim().max(200),
	note: z.string().trim().max(300)
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

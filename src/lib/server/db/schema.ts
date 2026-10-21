import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
// Path relatif (bukan $lib) supaya drizzle-kit bisa membaca skema ini
import {
	ORDER_STATUS,
	PO_STATUS,
	REFUND_REASON,
	REFUND_STATUS,
	type ProductImage,
	type SizeRow
} from '../../shop/constants';

const createdAt = () =>
	integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.$defaultFn(() => new Date());
const updatedAt = () =>
	integer('updated_at', { mode: 'timestamp_ms' })
		.notNull()
		.$defaultFn(() => new Date())
		.$onUpdate(() => new Date());

// ── Katalog ──

export const categories = sqliteTable('categories', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	slug: text('slug').notNull().unique(),
	name: text('name').notNull(),
	description: text('description').notNull().default(''),
	/** Versi English (kosong = pakai Bahasa Indonesia) */
	nameEn: text('name_en').notNull().default(''),
	descriptionEn: text('description_en').notNull().default(''),
	sort: integer('sort').notNull().default(0)
});

export const products = sqliteTable('products', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	slug: text('slug').notNull().unique(),
	categoryId: integer('category_id')
		.notNull()
		.references(() => categories.id),
	name: text('name').notNull(),
	/** Satu kalimat untuk kartu produk & banner */
	summary: text('summary').notNull().default(''),
	description: text('description').notNull().default(''),
	/** Detail produk, satu poin per baris */
	details: text('details').notNull().default(''),
	/** Versi English (kosong = pakai Bahasa Indonesia) */
	nameEn: text('name_en').notNull().default(''),
	summaryEn: text('summary_en').notNull().default(''),
	descriptionEn: text('description_en').notNull().default(''),
	detailsEn: text('details_en').notNull().default(''),
	price: integer('price').notNull(),
	sizes: text('sizes', { mode: 'json' })
		.$type<string[]>()
		.notNull()
		.$defaultFn(() => []),
	sizeChart: text('size_chart', { mode: 'json' })
		.$type<SizeRow[]>()
		.notNull()
		.$defaultFn(() => []),
	images: text('images', { mode: 'json' })
		.$type<ProductImage[]>()
		.notNull()
		.$defaultFn(() => []),
	/** Lama produksi standar (hari) untuk PO baru */
	productionDays: integer('production_days').notNull().default(14),
	active: integer('active', { mode: 'boolean' }).notNull().default(true),
	featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
	sort: integer('sort').notNull().default(0),
	createdAt: createdAt(),
	updatedAt: updatedAt()
});

/** Satu PO (batch) per produk; batch berikutnya dibuka admin setelah batch lama selesai/gagal */
export const poBatches = sqliteTable(
	'po_batches',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		productId: integer('product_id')
			.notNull()
			.references(() => products.id, { onDelete: 'cascade' }),
		batchNo: integer('batch_no').notNull(),
		/** Minimum pcs (semua ukuran dijumlah) */
		target: integer('target').notNull(),
		/** Deadline: 23:59:59 WIB pada tanggal yang dipilih admin */
		closesAt: integer('closes_at', { mode: 'timestamp_ms' }).notNull(),
		productionDays: integer('production_days').notNull(),
		status: text('status', { enum: PO_STATUS }).notNull().default('open'),
		closedAt: integer('closed_at', { mode: 'timestamp_ms' }),
		/** Jumlah terkumpul saat PO ditutup (riwayat) */
		collectedAtClose: integer('collected_at_close'),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [uniqueIndex('po_batches_product_batch').on(t.productId, t.batchNo)]
);

// ── Mitra & pesanan ──

export const partners = sqliteTable('partners', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	/** Kode mitra, huruf besar */
	code: text('code').notNull().unique(),
	name: text('name').notNull(),
	/** Nomor WhatsApp format 62… */
	phone: text('phone').notNull(),
	city: text('city').notNull().default(''),
	active: integer('active', { mode: 'boolean' }).notNull().default(true),
	createdAt: createdAt(),
	updatedAt: updatedAt()
});

export const orders = sqliteTable(
	'orders',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		/** Nomor pesanan untuk manusia, mis. IE-261021-0007 */
		code: text('code').notNull().unique(),
		/** Rahasia untuk link status pesanan (tanpa login) */
		token: text('token').notNull().unique(),
		partnerId: integer('partner_id').references(() => partners.id),
		partnerCode: text('partner_code').notNull(),
		customerName: text('customer_name').notNull(),
		phone: text('phone').notNull(),
		email: text('email'),
		address: text('address').notNull(),
		city: text('city').notNull(),
		postalCode: text('postal_code').notNull().default(''),
		note: text('note').notNull().default(''),
		shippingZone: text('shipping_zone').notNull(),
		shippingFee: integer('shipping_fee').notNull(),
		subtotal: integer('subtotal').notNull(),
		/** 1–999 rupiah agar nominal tiap pesanan unik di riwayat GoPay Merchant */
		uniqueCode: integer('unique_code').notNull(),
		total: integer('total').notNull(),
		status: text('status', { enum: ORDER_STATUS }).notNull().default('pending_payment'),
		payBy: integer('pay_by', { mode: 'timestamp_ms' }).notNull(),
		proofPath: text('proof_path'),
		proofAt: integer('proof_at', { mode: 'timestamp_ms' }),
		rejectReason: text('reject_reason'),
		paidAt: integer('paid_at', { mode: 'timestamp_ms' }),
		trackingNo: text('tracking_no'),
		shippedAt: integer('shipped_at', { mode: 'timestamp_ms' }),
		cancelledAt: integer('cancelled_at', { mode: 'timestamp_ms' }),
		cancelReason: text('cancel_reason'),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [index('orders_status').on(t.status), index('orders_phone').on(t.phone)]
);

export const refunds = sqliteTable(
	'refunds',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		orderId: integer('order_id')
			.notNull()
			.references(() => orders.id, { onDelete: 'cascade' }),
		amount: integer('amount').notNull(),
		reason: text('reason', { enum: REFUND_REASON }).notNull(),
		status: text('status', { enum: REFUND_STATUS }).notNull().default('pending'),
		/** Tujuan transfer dari pembeli, mis. "GoPay 0812…" atau "BCA 123… a.n. …" */
		destination: text('destination').notNull().default(''),
		note: text('note').notNull().default(''),
		doneAt: integer('done_at', { mode: 'timestamp_ms' }),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [index('refunds_status').on(t.status)]
);

export const orderItems = sqliteTable(
	'order_items',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		orderId: integer('order_id')
			.notNull()
			.references(() => orders.id, { onDelete: 'cascade' }),
		productId: integer('product_id')
			.notNull()
			.references(() => products.id),
		batchId: integer('batch_id')
			.notNull()
			.references(() => poBatches.id),
		productName: text('product_name').notNull(),
		unitPrice: integer('unit_price').notNull(),
		size: text('size'),
		qty: integer('qty').notNull(),
		/** Diisi saat item ini ikut dikembalikan dananya */
		refundId: integer('refund_id').references(() => refunds.id)
	},
	(t) => [index('order_items_batch').on(t.batchId), index('order_items_order').on(t.orderId)]
);

// ── Pengaturan toko ──

export const shippingZones = sqliteTable('shipping_zones', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	fee: integer('fee').notNull(),
	active: integer('active', { mode: 'boolean' }).notNull().default(true),
	sort: integer('sort').notNull().default(0)
});

/** Halaman info yang bisa diubah admin (markdown) */
export const pages = sqliteTable('pages', {
	slug: text('slug').primaryKey(),
	title: text('title').notNull(),
	body: text('body').notNull().default(''),
	titleEn: text('title_en').notNull().default(''),
	bodyEn: text('body_en').notNull().default(''),
	updatedAt: updatedAt()
});

export const settings = sqliteTable('settings', {
	key: text('key').primaryKey(),
	value: text('value', { mode: 'json' }).$type<unknown>()
});

// ── Better Auth (login admin) — skema inti Better Auth ──

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
	image: text('image'),
	createdAt: createdAt(),
	updatedAt: updatedAt()
});

export const session = sqliteTable(
	'session',
	{
		id: text('id').primaryKey(),
		expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
		token: text('token').notNull().unique(),
		createdAt: createdAt(),
		updatedAt: updatedAt(),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' })
	},
	(t) => [index('session_user').on(t.userId)]
);

export const account = sqliteTable(
	'account',
	{
		id: text('id').primaryKey(),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		idToken: text('id_token'),
		accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp_ms' }),
		refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp_ms' }),
		scope: text('scope'),
		password: text('password'),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [index('account_user').on(t.userId)]
);

export const verification = sqliteTable(
	'verification',
	{
		id: text('id').primaryKey(),
		identifier: text('identifier').notNull(),
		value: text('value').notNull(),
		expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [index('verification_identifier').on(t.identifier)]
);

export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type PoBatch = typeof poBatches.$inferSelect;
export type Partner = typeof partners.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Refund = typeof refunds.$inferSelect;
export type ShippingZone = typeof shippingZones.$inferSelect;
export type InfoPage = typeof pages.$inferSelect;

import { and, asc, desc, eq, inArray, isNull, sql } from 'drizzle-orm';
import type { Lang } from '$lib/shop/i18n';
import { poPhase } from '$lib/shop/po';
import type { BatchView, CategoryView, ProductCardView, ProductDetailView } from '$lib/shop/types';
import type { Conn as DB } from '../db';
import {
	categories,
	orderItems,
	orders,
	poBatches,
	products,
	type PoBatch,
	type Product
} from '../db/schema';

/** Pcs terkumpul per batch: hanya pesanan lunas/dikirim yang belum direfund */
export function collectedByBatch(db: DB, batchIds?: number[]): Map<number, number> {
	if (batchIds && batchIds.length === 0) return new Map();
	const rows = db
		.select({ batchId: orderItems.batchId, qty: sql<number>`sum(${orderItems.qty})` })
		.from(orderItems)
		.innerJoin(orders, eq(orders.id, orderItems.orderId))
		.where(
			and(
				inArray(orders.status, ['paid', 'shipped']),
				isNull(orderItems.refundId),
				batchIds ? inArray(orderItems.batchId, batchIds) : undefined
			)
		)
		.groupBy(orderItems.batchId)
		.all();
	return new Map(rows.map((r) => [r.batchId, Number(r.qty)]));
}

export function toBatchView(b: PoBatch, collected: Map<number, number>): BatchView {
	const closed = b.status !== 'open' && b.collectedAtClose != null;
	return {
		id: b.id,
		batchNo: b.batchNo,
		target: b.target,
		collected: closed ? (b.collectedAtClose as number) : (collected.get(b.id) ?? 0),
		closesAt: b.closesAt.getTime(),
		productionDays: b.productionDays,
		status: b.status
	};
}

/** Batch terbaru (nomor tertinggi) per produk */
export function latestBatches(db: DB, productIds?: number[]): Map<number, PoBatch> {
	const rows = db
		.select()
		.from(poBatches)
		.where(productIds ? inArray(poBatches.productId, productIds) : undefined)
		.orderBy(asc(poBatches.productId), desc(poBatches.batchNo))
		.all();
	const map = new Map<number, PoBatch>();
	for (const b of rows) if (!map.has(b.productId)) map.set(b.productId, b);
	return map;
}

/** Teks English bila ada, selain itu Bahasa Indonesia */
export const pick = (lang: Lang, idText: string, enText: string | null | undefined) =>
	lang === 'en' && enText ? enText : idText;

type CatRow = { slug: string; name: string; nameEn: string };

function toCard(
	p: Product,
	cat: CatRow,
	batch: PoBatch | undefined,
	collected: Map<number, number>,
	lang: Lang
): ProductCardView {
	return {
		id: p.id,
		slug: p.slug,
		name: pick(lang, p.name, p.nameEn),
		summary: pick(lang, p.summary, p.summaryEn),
		price: p.price,
		sizes: p.sizes,
		images: p.images,
		category: { slug: cat.slug, name: pick(lang, cat.name, cat.nameEn) },
		batch: batch ? toBatchView(batch, collected) : null,
		createdAt: p.createdAt.getTime()
	};
}

const catCols = { slug: categories.slug, name: categories.name, nameEn: categories.nameEn };

export function listProducts(
	db: DB,
	opts: { categorySlug?: string; includeInactive?: boolean; lang?: Lang } = {}
): ProductCardView[] {
	const rows = db
		.select({ p: products, cat: catCols })
		.from(products)
		.innerJoin(categories, eq(categories.id, products.categoryId))
		.where(
			and(
				opts.includeInactive ? undefined : eq(products.active, true),
				opts.categorySlug ? eq(categories.slug, opts.categorySlug) : undefined
			)
		)
		.orderBy(asc(products.sort), asc(products.id))
		.all();
	const batches = latestBatches(
		db,
		rows.map((r) => r.p.id)
	);
	const collected = collectedByBatch(
		db,
		[...batches.values()].map((b) => b.id)
	);
	return rows.map((r) => toCard(r.p, r.cat, batches.get(r.p.id), collected, opts.lang ?? 'id'));
}

export function getProductBySlug(
	db: DB,
	slug: string,
	opts: { includeInactive?: boolean; lang?: Lang } = {}
): ProductDetailView | null {
	const lang = opts.lang ?? 'id';
	const includeInactive = !!opts.includeInactive;
	const row = db
		.select({ p: products, cat: catCols })
		.from(products)
		.innerJoin(categories, eq(categories.id, products.categoryId))
		.where(and(eq(products.slug, slug), includeInactive ? undefined : eq(products.active, true)))
		.get();
	if (!row) return null;
	const batch = latestBatches(db, [row.p.id]).get(row.p.id);
	const collected = collectedByBatch(db, batch ? [batch.id] : []);
	return {
		...toCard(row.p, row.cat, batch, collected, lang),
		description: pick(lang, row.p.description, row.p.descriptionEn),
		details: pick(lang, row.p.details, row.p.detailsEn),
		sizeChart: row.p.sizeChart,
		productionDays: row.p.productionDays
	};
}

export function listCategories(db: DB, lang: Lang = 'id'): CategoryView[] {
	const cats = db.select().from(categories).orderBy(asc(categories.sort), asc(categories.id)).all();
	const prods = db
		.select({ categoryId: products.categoryId, images: products.images })
		.from(products)
		.where(eq(products.active, true))
		.orderBy(asc(products.sort), asc(products.id))
		.all();
	return cats.map((c) => {
		const own = prods.filter((p) => p.categoryId === c.id);
		const withPhoto = own.find((p) => p.images[0] && !p.images[0].placeholder) ?? own[0];
		return {
			id: c.id,
			slug: c.slug,
			name: pick(lang, c.name, c.nameEn),
			description: pick(lang, c.description, c.descriptionEn),
			count: own.length,
			image: withPhoto?.images[0] ?? null
		};
	});
}

// ── Urutan & filter katalog ──

export const SORTS = {
	segera: 'Segera ditutup',
	terbaru: 'Terbaru',
	termurah: 'Harga terendah',
	termahal: 'Harga tertinggi'
} as const;
export type SortKey = keyof typeof SORTS;

export const STATUS_FILTERS = {
	semua: 'Semua',
	po: 'Sedang PO',
	tercapai: 'Target tercapai',
	segera: 'Segera ditutup'
} as const;
export type StatusFilter = keyof typeof STATUS_FILTERS;

const ORDERABLE_RANK: Record<string, number> = { closing: 0, open: 1, reached: 1, closed: 2, production: 3, none: 4, done: 5, failed: 6 };

export function sortProducts(list: ProductCardView[], sort: SortKey, now: number) {
	const out = [...list];
	if (sort === 'segera') {
		out.sort((a, b) => {
			const ra = ORDERABLE_RANK[poPhase(a.batch, now)];
			const rb = ORDERABLE_RANK[poPhase(b.batch, now)];
			if (ra !== rb) return ra - rb;
			return (a.batch?.closesAt ?? Infinity) - (b.batch?.closesAt ?? Infinity);
		});
	} else if (sort === 'terbaru') out.sort((a, b) => b.createdAt - a.createdAt || b.id - a.id);
	else if (sort === 'termurah') out.sort((a, b) => a.price - b.price);
	else if (sort === 'termahal') out.sort((a, b) => b.price - a.price);
	return out;
}

export function filterByStatus(list: ProductCardView[], f: StatusFilter, now: number) {
	if (f === 'semua') return list;
	return list.filter((p) => {
		const phase = poPhase(p.batch, now);
		if (f === 'po') return phase === 'open' || phase === 'closing' || phase === 'reached';
		if (f === 'tercapai') return phase === 'reached';
		return phase === 'closing';
	});
}

export function searchProducts(list: ProductCardView[], q: string) {
	const words = q.toLowerCase().split(/\s+/).filter(Boolean);
	if (!words.length) return [];
	return list.filter((p) => {
		const hay = `${p.name} ${p.summary} ${p.category.name}`.toLowerCase();
		return words.every((w) => hay.includes(w));
	});
}

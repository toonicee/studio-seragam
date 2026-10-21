/** Keranjang disimpan di cookie (productId, ukuran, jumlah); harga & status PO selalu dibaca ulang dari database */
import type { Cookies } from '@sveltejs/kit';
import { inArray } from 'drizzle-orm';
import { MAX_QTY } from '$lib/shop/constants';
import { isOrderable } from '$lib/shop/po';
import { fmtDayShort } from '$lib/shop/format';
import type { CartLineView, CartView } from '$lib/shop/types';
import type { Conn as DB } from '../db';
import { products } from '../db/schema';
import { collectedByBatch, latestBatches, toBatchView } from './catalog';

export type CartLine = { productId: number; size: string | null; qty: number };

const COOKIE = 'ie_cart';
const MAX_LINES = 30;

export const lineKey = (l: Pick<CartLine, 'productId' | 'size'>) => `${l.productId}:${l.size ?? ''}`;

export function readCart(cookies: Cookies): CartLine[] {
	const raw = cookies.get(COOKIE);
	if (!raw) return [];
	try {
		const data = JSON.parse(raw);
		if (!Array.isArray(data)) return [];
		const out: CartLine[] = [];
		for (const item of data.slice(0, MAX_LINES)) {
			if (!Array.isArray(item)) continue;
			const [productId, size, qty] = item;
			if (!Number.isInteger(productId) || !Number.isInteger(qty) || qty < 1) continue;
			if (size !== null && typeof size !== 'string') continue;
			out.push({ productId, size, qty: Math.min(qty, MAX_QTY) });
		}
		return out;
	} catch {
		return [];
	}
}

export function writeCart(cookies: Cookies, lines: CartLine[]) {
	if (!lines.length) {
		cookies.delete(COOKIE, { path: '/shop' });
		return;
	}
	cookies.set(COOKIE, JSON.stringify(lines.slice(0, MAX_LINES).map((l) => [l.productId, l.size, l.qty])), {
		path: '/shop',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 30
	});
}

export function addLine(lines: CartLine[], line: CartLine): CartLine[] {
	const key = lineKey(line);
	const existing = lines.find((l) => lineKey(l) === key);
	if (existing) {
		return lines.map((l) => (l === existing ? { ...l, qty: Math.min(MAX_QTY, l.qty + line.qty) } : l));
	}
	return [...lines, { ...line, qty: Math.min(MAX_QTY, line.qty) }];
}

export function setLineQty(lines: CartLine[], key: string, qty: number): CartLine[] {
	if (qty < 1) return lines.filter((l) => lineKey(l) !== key);
	return lines.map((l) => (lineKey(l) === key ? { ...l, qty: Math.min(MAX_QTY, qty) } : l));
}

export function removeLine(lines: CartLine[], key: string): CartLine[] {
	return lines.filter((l) => lineKey(l) !== key);
}

/** Lengkapi isi keranjang dengan data produk & PO terbaru */
export function resolveCart(db: DB, lines: CartLine[], now: number): CartView {
	const ids = [...new Set(lines.map((l) => l.productId))];
	const prods = ids.length ? db.select().from(products).where(inArray(products.id, ids)).all() : [];
	const byId = new Map(prods.map((p) => [p.id, p]));
	const batches = latestBatches(db, ids);
	const collected = collectedByBatch(
		db,
		[...batches.values()].map((b) => b.id)
	);

	const out: CartLineView[] = [];
	for (const l of lines) {
		const p = byId.get(l.productId);
		if (!p) continue;
		const b = batches.get(p.id);
		const batch = b ? toBatchView(b, collected) : null;
		let problem: string | null = null;
		if (!p.active) problem = 'Produk tidak dijual lagi';
		else if (!batch) problem = 'PO belum dibuka';
		else if (!isOrderable(batch, now)) problem = `PO ditutup ${fmtDayShort(batch.closesAt)}`;
		else if (p.sizes.length ? !l.size || !p.sizes.includes(l.size) : l.size !== null)
			problem = 'Ukuran tidak tersedia, hapus lalu pilih ulang';
		out.push({
			key: lineKey(l),
			productId: p.id,
			slug: p.slug,
			name: p.name,
			image: p.images[0] ?? null,
			price: p.price,
			size: l.size,
			qty: l.qty,
			lineTotal: p.price * l.qty,
			batch,
			orderable: problem === null,
			problem
		});
	}
	return {
		lines: out,
		count: out.reduce((s, l) => s + l.qty, 0),
		subtotal: out.reduce((s, l) => s + l.lineTotal, 0),
		ready: out.length > 0 && out.every((l) => l.orderable)
	};
}

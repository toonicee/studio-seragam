/** Data contoh toko. Katalog contoh hanya memakai aset yang sudah ada di repo (foto katalog, render 3D, logo). */
import { eq, sql } from 'drizzle-orm';
import sharp from 'sharp';
import { PRODUCTS } from '$lib/constants/catalog';
import { addDays, wibDateString, wibDeadline } from '$lib/shop/po';
import type { ProductImage, SizeRow } from '$lib/shop/constants';
import type { Conn } from '../db';
import {
	categories,
	orderItems,
	orders,
	pages,
	partners,
	poBatches,
	products,
	shippingZones
} from '../db/schema';
import { orderCode } from './orders';
import { runScheduledTasks } from './scheduler';
import { saveBuffer } from './uploads';
import { INFO_PAGE_CONTENT } from './content';

const DAY = 86_400_000;

const chart = (rows: [string, number | null, number | null][]): SizeRow[] =>
	rows.map(([size, length, width]) => ({ size, length, width }));

const img = (src: string, alt: string, placeholder = false): ProductImage =>
	placeholder ? { src, alt, placeholder: true } : { src, alt };

interface SampleProduct {
	slug: string;
	category: string;
	name: string;
	summary: string;
	description: string;
	details: string[];
	price: number;
	sizes: SizeRow[];
	images: ProductImage[];
	productionDays: number;
	featured?: boolean;
	/** PO pertama: target pcs & tutup N hari dari sekarang */
	target: number;
	closeInDays: number;
}

export const SAMPLE_CATEGORIES = [
	{ slug: 'pakaian', name: 'Pakaian', description: 'Kaos, kemeja, polo, dan rompi resmi Indah Expres.' },
	{ slug: 'topi-aksesoris', name: 'Topi & Aksesoris', description: 'Pelengkap seragam dan suvenir untuk tim.' },
	{ slug: 'tas', name: 'Tas', description: 'Tas kanvas bertanda Indah Expres untuk kerja dan sehari-hari.' },
	{ slug: 'rumah-kantor', name: 'Rumah & Kantor', description: 'Perlengkapan minum untuk kantor, gudang, dan rumah.' }
];

export const SAMPLE_PRODUCTS: SampleProduct[] = [
	{
		slug: 'kaos-indah-expres',
		category: 'pakaian',
		name: 'Kaos Indah Expres',
		summary: 'Kaos putih Dri-Fit dengan sablon logo oranye.',
		description:
			'Kaos resmi Indah Expres berwarna putih dengan sablon logo oranye di dada dan punggung. Bahan Dri-Fit ringan, cepat kering, dan adem untuk kegiatan lapangan. Sablon DTF tetap tajam setelah berkali-kali dicuci.',
		details: ['Bahan Dri-Fit 2720', 'Sablon DTF depan & belakang', 'Potongan regular unisex', 'Warna putih, sablon oranye', 'Cuci dengan air dingin, jangan setrika di atas sablon'],
		price: 72000,
		sizes: chart(PRODUCTS.kaos.sizes),
		images: [
			img('/katalog/kaos-pria.jpg', 'Kurir pria memakai Kaos Indah Expres putih berlogo oranye'),
			img('/katalog/kaos-wanita.jpg', 'Staf wanita memakai Kaos Indah Expres putih berlogo oranye'),
			img('/shop-img/kaos-belakang.webp', 'Tampak belakang Kaos Indah Expres dengan logo di punggung')
		],
		productionDays: 14,
		featured: true,
		target: 50,
		closeInDays: 12
	},
	{
		slug: 'kemeja-lengan-pendek',
		category: 'pakaian',
		name: 'Kemeja Lengan Pendek',
		summary: 'Kemeja putih beraksen oranye dengan bordir logo.',
		description:
			'Kemeja kerja putih dengan aksen oranye di kerah, plaket, manset lengan, dan tutup saku. Kain Unione American bertekstur drill: kuat, tidak mudah kusut, dan tetap rapi seharian. Logo dibordir di dada.',
		details: ['Kain Unione American (drill)', 'Bordir logo dada kiri & punggung', '2 saku tempel dengan tutup', 'Aksen oranye di kerah, plaket, manset, dan saku', 'Kancing senada aksen'],
		price: 130900,
		sizes: chart(PRODUCTS.kemeja.sizes),
		images: [
			img('/katalog/kemeja-pendek-pria.jpg', 'Staf pria memakai kemeja putih lengan pendek beraksen oranye'),
			img('/katalog/kemeja-pendek-wanita.jpg', 'Staf wanita memakai kemeja putih lengan pendek beraksen oranye'),
			img('/shop-img/kemeja-pendek-belakang.webp', 'Tampak belakang kemeja lengan pendek dengan bordir punggung')
		],
		productionDays: 21,
		featured: true,
		target: 36,
		closeInDays: 9
	},
	{
		slug: 'kemeja-lengan-panjang',
		category: 'pakaian',
		name: 'Kemeja Lengan Panjang',
		summary: 'Kemeja eksekutif dengan manset berkancing.',
		description:
			'Versi lengan panjang untuk rapat dan acara resmi. Manset berkancing bisa digulung saat bekerja di lapangan. Kain Unione American yang sama kuatnya dengan kemeja lengan pendek.',
		details: ['Kain Unione American (drill)', 'Manset berkancing, bisa digulung', 'Bordir logo dada kiri & punggung', 'Aksen oranye di kerah dan manset'],
		price: 152300,
		sizes: chart(PRODUCTS.kemejaPanjang.sizes),
		images: [
			img('/katalog/kemeja-panjang-wanita.jpg', 'Staf wanita memakai kemeja putih lengan panjang beraksen oranye'),
			{ ...img('/katalog/kemeja-panjang-pria.jpg', 'Staf pria memakai kemeja putih lengan panjang beraksen oranye'), zoom: 1.14 },
			img('/shop-img/kemeja-panjang-belakang.webp', 'Tampak belakang kemeja lengan panjang')
		],
		productionDays: 21,
		target: 36,
		closeInDays: 20
	},
	{
		slug: 'kaos-polo',
		category: 'pakaian',
		name: 'Kaos Polo',
		summary: 'Polo lacoste putih dengan kancing oranye.',
		description:
			'Rapi tanpa harus berkemeja. Bahan lacoste pique berpori sehingga nyaman dipakai seharian di konter maupun gudang. Logo dibordir di dada kiri dan punggung.',
		details: ['Bahan Lacoste Pique', 'Bordir logo dada kiri & punggung', 'Warna putih dengan kancing oranye'],
		price: 75000,
		sizes: chart(PRODUCTS.polo.sizes),
		images: [
			img('/shop-img/polo-depan.webp', 'Kaos polo putih Indah Expres tampak depan'),
			img('/shop-img/polo-belakang.webp', 'Kaos polo putih Indah Expres tampak belakang')
		],
		productionDays: 14,
		featured: true,
		target: 40,
		closeInDays: 5
	},
	{
		slug: 'rompi-lapangan',
		category: 'pakaian',
		name: 'Rompi Lapangan',
		summary: 'Rompi oranye dengan list reflektif untuk tim jalan.',
		description:
			'Rompi oranye yang ringan untuk driver dan tim lapangan. Permukaan taslan halus dan anti percik, dengan list reflektif supaya tetap terlihat di jalan saat malam.',
		details: ['Bahan taslan anti percik', 'List reflektif di dada', 'Ritsleting depan & 2 saku kargo', 'Bordir logo dada & punggung'],
		price: 165000,
		sizes: chart(PRODUCTS.rompi.sizes),
		images: [
			img('/shop-img/rompi-depan.webp', 'Rompi lapangan Indah Expres tampak depan'),
			img('/shop-img/rompi-belakang.webp', 'Rompi lapangan Indah Expres tampak belakang')
		],
		productionDays: 21,
		target: 30,
		closeInDays: 15
	},
	{
		slug: 'topi-indah-expres',
		category: 'topi-aksesoris',
		name: 'Topi Indah Expres',
		summary: 'Topi baseball twill dengan bordir logo depan.',
		description:
			'Topi baseball dari kain twill tebal dengan bordir logo Indah Expres di depan. Tali belakang bisa diatur sehingga pas untuk semua ukuran kepala.',
		details: ['Kain twill katun', 'Bordir logo depan', 'Tali belakang bisa diatur', 'Satu ukuran'],
		price: 45000,
		sizes: [],
		images: [img('/shop-img/topi.webp', 'Gambar sementara Topi Indah Expres', true)],
		productionDays: 14,
		target: 50,
		closeInDays: 6
	},
	{
		slug: 'gantungan-kunci',
		category: 'topi-aksesoris',
		name: 'Gantungan Kunci',
		summary: 'Gantungan kunci akrilik bentuk logo Indah Expres.',
		description: 'Gantungan kunci akrilik bening dengan cetak logo Indah Expres dua sisi. Ringan dan cocok untuk kunci motor atau tas.',
		details: ['Akrilik 3 mm', 'Cetak UV dua sisi', 'Ring besi anti karat'],
		price: 15000,
		sizes: [],
		images: [img('/shop-img/gantungan-kunci.webp', 'Gambar sementara Gantungan Kunci Indah Expres', true)],
		productionDays: 10,
		target: 100,
		closeInDays: 8
	},
	{
		slug: 'tote-bag-kanvas',
		category: 'tas',
		name: 'Tote Bag Kanvas',
		summary: 'Tas kanvas 12 oz, muat laptop 14 inci.',
		description: 'Tote bag kanvas tebal dengan sablon logo Indah Expres. Muat laptop 14 inci dan dokumen, cocok untuk kerja maupun belanja.',
		details: ['Kanvas 12 oz', 'Sablon logo satu sisi', 'Ukuran 38 × 42 cm', 'Tali bahu 60 cm'],
		price: 55000,
		sizes: [],
		images: [img('/shop-img/tote-bag.webp', 'Gambar sementara Tote Bag Kanvas Indah Expres', true)],
		productionDays: 14,
		target: 50,
		closeInDays: 4
	},
	{
		slug: 'tumbler-500ml',
		category: 'rumah-kantor',
		name: 'Tumbler 500 ml',
		summary: 'Tumbler stainless dua lapis dengan grafir logo.',
		description: 'Tumbler stainless steel dua lapis yang menjaga minuman tetap dingin hingga 12 jam atau panas hingga 6 jam. Logo Indah Expres digrafir laser sehingga tidak luntur.',
		details: ['Stainless steel 304 dua lapis', 'Kapasitas 500 ml', 'Grafir laser logo', 'Tutup anti tumpah'],
		price: 85000,
		sizes: [],
		images: [img('/shop-img/tumbler.webp', 'Gambar sementara Tumbler Indah Expres', true)],
		productionDays: 21,
		target: 40,
		closeInDays: 18
	},
	{
		slug: 'mug-keramik',
		category: 'rumah-kantor',
		name: 'Mug Keramik',
		summary: 'Mug keramik putih 350 ml dengan logo oranye.',
		description: 'Mug keramik putih 350 ml dengan cetak logo Indah Expres berwarna oranye. Aman untuk microwave dan mesin cuci piring.',
		details: ['Keramik 350 ml', 'Cetak sublim logo', 'Aman untuk microwave'],
		price: 40000,
		sizes: [],
		images: [img('/shop-img/mug.webp', 'Gambar sementara Mug Indah Expres', true)],
		productionDays: 14,
		target: 60,
		closeInDays: 10
	}
];

/** Isi katalog contoh, halaman info, dan tarif ongkir bila database masih kosong */
export function seedSample(db: Conn, now: Date) {
	const hasProducts = db.select({ n: sql<number>`count(*)` }).from(products).get()!.n > 0;
	db.transaction((tx) => {
		for (const p of INFO_PAGE_CONTENT) {
			tx.insert(pages).values(p).onConflictDoNothing().run();
		}
		const zones = tx.select({ n: sql<number>`count(*)` }).from(shippingZones).get()!.n;
		if (!zones) tx.insert(shippingZones).values({ name: 'Tarif flat seluruh Indonesia', fee: 20000, sort: 0 }).run();
		if (hasProducts) return;

		const catIds = new Map<string, number>();
		SAMPLE_CATEGORIES.forEach((c, i) => {
			const { id } = tx.insert(categories).values({ ...c, sort: i }).returning({ id: categories.id }).get();
			catIds.set(c.slug, id);
		});

		const today = wibDateString(now.getTime());
		SAMPLE_PRODUCTS.forEach((p, i) => {
			const created = new Date(now.getTime() - (SAMPLE_PRODUCTS.length - i) * 3600_000);
			const { id } = tx
				.insert(products)
				.values({
					slug: p.slug,
					categoryId: catIds.get(p.category)!,
					name: p.name,
					summary: p.summary,
					description: p.description,
					details: p.details.join('\n'),
					price: p.price,
					sizes: p.sizes.map((s) => s.size),
					sizeChart: p.sizes.some((s) => s.length !== null) ? p.sizes : [],
					images: p.images,
					productionDays: p.productionDays,
					featured: !!p.featured,
					sort: i,
					createdAt: created,
					updatedAt: created
				})
				.returning({ id: products.id })
				.get();
			tx.insert(poBatches)
				.values({
					productId: id,
					batchNo: 1,
					target: p.target,
					closesAt: wibDeadline(addDays(today, p.closeInDays)),
					productionDays: p.productionDays,
					status: 'open',
					createdAt: created,
					updatedAt: created
				})
				.run();
		});
	});
}

// ── Data demo (hanya untuk melihat tampilan saat pengembangan) ──

const DEMO_PARTNERS = [
	{ code: 'DEMO', name: 'Mitra Uji Coba', phone: '6281234567890', city: 'Medan' },
	{ code: 'MITRA-001', name: 'Mitra Contoh Medan', phone: '6281200000001', city: 'Medan' },
	{ code: 'MITRA-002', name: 'Mitra Contoh Pekanbaru', phone: '6281200000002', city: 'Pekanbaru' },
	{ code: 'MITRA-003', name: 'Mitra Contoh Batam', phone: '6281200000003', city: 'Batam' },
	{ code: 'MITRA-004', name: 'Mitra Contoh Jakarta', phone: '6281200000004', city: 'Jakarta Barat' },
	{ code: 'MITRA-005', name: 'Mitra Contoh Palembang', phone: '6281200000005', city: 'Palembang' }
];

const DEMO_NAMES = ['Budi Santoso', 'Siti Rahmawati', 'Andi Pratama', 'Dewi Lestari', 'Rizky Hidayat', 'Nur Aisyah', 'Fajar Nugroho', 'Maya Sari'];

/** Pcs terkumpul untuk tiap produk contoh; gantungan kunci → produksi, mug → gagal */
const DEMO_COLLECTED: Record<string, number> = {
	'kaos-indah-expres': 52,
	'kemeja-lengan-pendek': 21,
	'kemeja-lengan-panjang': 8,
	'kaos-polo': 31,
	'rompi-lapangan': 4,
	'topi-indah-expres': 18,
	'gantungan-kunci': 120,
	'tote-bag-kanvas': 33,
	'tumbler-500ml': 12,
	'mug-keramik': 23
};

async function sampleProof() {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280"><rect width="720" height="1280" fill="#f4f6f8"/><rect x="60" y="160" width="600" height="760" rx="28" fill="#fff"/><circle cx="360" cy="300" r="64" fill="#00aa5b"/><path d="M325 300l25 25 48-52" stroke="#fff" stroke-width="16" fill="none" stroke-linecap="round"/><text x="360" y="440" font-family="Arial" font-size="40" font-weight="700" text-anchor="middle" fill="#17202a">Pembayaran Berhasil</text><text x="360" y="520" font-family="Arial" font-size="56" font-weight="700" text-anchor="middle" fill="#17202a">CONTOH</text><text x="360" y="600" font-family="Arial" font-size="28" text-anchor="middle" fill="#5b6670">Bukti bayar contoh (data demo)</text></svg>`;
	const buf = await sharp(Buffer.from(svg)).webp({ quality: 80 }).toBuffer();
	return saveBuffer(buf, 'proofs', 'demo');
}

/** Mitra & pesanan contoh supaya semua status PO terlihat. Hanya jalan sekali (bila belum ada pesanan) */
export async function seedDemo(db: Conn, now: Date) {
	const hasOrders = db.select({ n: sql<number>`count(*)` }).from(orders).get()!.n > 0;
	if (hasOrders) return false;
	const prods = db.select().from(products).all();
	if (!prods.length) return false;
	const proof = await sampleProof();
	const t = now.getTime();

	db.transaction((tx) => {
		const partnerIds: number[] = [];
		for (const p of DEMO_PARTNERS) {
			const existing = tx.select({ id: partners.id }).from(partners).where(eq(partners.code, p.code)).get();
			partnerIds.push(
				existing?.id ?? tx.insert(partners).values(p).returning({ id: partners.id }).get().id
			);
		}

		// PO contoh yang sudah lewat deadline (ditutup oleh proses otomatis di bawah)
		const today = wibDateString(t);
		const pastClose: Record<string, number> = { 'gantungan-kunci': -3, 'mug-keramik': -2 };
		// Polo: tutup besok supaya terlihat "segera ditutup"
		for (const p of prods) {
			const b = tx.select().from(poBatches).where(eq(poBatches.productId, p.id)).get();
			if (!b) continue;
			if (p.slug in pastClose) {
				tx.update(poBatches)
					.set({ closesAt: wibDeadline(addDays(today, pastClose[p.slug])) })
					.where(eq(poBatches.id, b.id))
					.run();
			} else if (p.slug === 'kaos-polo') {
				tx.update(poBatches).set({ closesAt: wibDeadline(addDays(today, 1)) }).where(eq(poBatches.id, b.id)).run();
			}
		}

		let seq = 0;
		const addOrder = (
			p: (typeof prods)[number],
			batchId: number,
			qty: number,
			status: 'paid' | 'pending_payment' | 'pending_confirmation',
			ageHours: number
		) => {
			seq++;
			const created = new Date(t - ageHours * 3600_000);
			const partnerIdx = seq % DEMO_PARTNERS.length;
			const partner = DEMO_PARTNERS[partnerIdx];
			const size = p.sizes.length ? p.sizes[(seq * 7) % p.sizes.length] : null;
			const fee = 20000;
			const subtotal = p.price * qty;
			const uniqueCode = ((seq * 137) % 999) + 1;
			const token = `demo${seq.toString(36)}${Math.random().toString(36).slice(2, 12)}`;
			const { id } = tx
				.insert(orders)
				.values({
					code: token,
					token,
					partnerId: partnerIds[partnerIdx],
					partnerCode: partner.code,
					customerName: DEMO_NAMES[seq % DEMO_NAMES.length],
					phone: partner.phone,
					address: `Jl. Contoh No. ${seq}, RT 01/RW 02`,
					city: partner.city,
					postalCode: '20111',
					shippingZone: 'Tarif flat seluruh Indonesia',
					shippingFee: fee,
					subtotal,
					uniqueCode,
					total: subtotal + fee + uniqueCode,
					status,
					payBy: new Date(status === 'paid' ? created.getTime() + 20 * 3600_000 : t + 20 * 3600_000),
					proofPath: status === 'pending_payment' ? null : proof,
					proofAt: status === 'pending_payment' ? null : created,
					paidAt: status === 'paid' ? new Date(created.getTime() + 3 * 3600_000) : null,
					createdAt: created,
					updatedAt: created
				})
				.returning({ id: orders.id })
				.get();
			tx.update(orders).set({ code: orderCode(id, created) }).where(eq(orders.id, id)).run();
			tx.insert(orderItems)
				.values({ orderId: id, productId: p.id, batchId, productName: p.name, unitPrice: p.price, size, qty })
				.run();
			return id;
		};

		for (const p of prods) {
			const b = tx.select().from(poBatches).where(eq(poBatches.productId, p.id)).get();
			const want = DEMO_COLLECTED[p.slug];
			if (!b || !want) continue;
			const closed = p.slug in pastClose;
			let left = want;
			let age = closed ? 24 * 9 : 24 * 6;
			while (left > 0) {
				const qty = Math.min(left, 1 + (seq % 4));
				addOrder(p, b.id, qty, 'paid', age);
				left -= qty;
				age = Math.max(closed ? 80 : 4, age - 7);
			}
		}

		// Beberapa pesanan menunggu bayar / konfirmasi untuk antrean admin
		const bySlug = new Map(prods.map((p) => [p.slug, p]));
		const batchOf = (slug: string) =>
			tx.select().from(poBatches).where(eq(poBatches.productId, bySlug.get(slug)!.id)).get()!.id;
		addOrder(bySlug.get('kaos-indah-expres')!, batchOf('kaos-indah-expres'), 2, 'pending_confirmation', 3);
		addOrder(bySlug.get('kemeja-lengan-pendek')!, batchOf('kemeja-lengan-pendek'), 1, 'pending_confirmation', 5);
		addOrder(bySlug.get('topi-indah-expres')!, batchOf('topi-indah-expres'), 3, 'pending_payment', 2);
	});

	// Tutup PO contoh yang lewat deadline → gantungan kunci diproduksi, mug gagal + refund
	runScheduledTasks(db, now);

	// Satu pesanan gantungan kunci sudah dikirim
	const gantungan = db.select().from(products).where(eq(products.slug, 'gantungan-kunci')).get();
	if (gantungan) {
		const item = db
			.select({ orderId: orderItems.orderId })
			.from(orderItems)
			.innerJoin(poBatches, eq(poBatches.id, orderItems.batchId))
			.where(eq(poBatches.productId, gantungan.id))
			.get();
		if (item)
			db.update(orders)
				.set({ status: 'shipped', trackingNo: 'IEX2610210001', shippedAt: new Date(t - DAY) })
				.where(eq(orders.id, item.orderId))
				.run();
	}
	return true;
}

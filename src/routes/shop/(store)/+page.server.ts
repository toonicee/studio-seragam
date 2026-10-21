import { getDb } from '$lib/server/db';
import { listProducts, sortProducts } from '$lib/server/shop/catalog';
import { fmtDayLong, rupiah } from '$lib/shop/format';
import { isOrderable, poPhase } from '$lib/shop/po';
import type { HeroSlide } from '$lib/components/shop/HeroSlider.svelte';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const db = getDb();
	const now = Date.now();
	const all = listProducts(db);
	const orderable = all.filter((p) => isOrderable(p.batch, now));

	const featured = all.filter((p) => isOrderable(p.batch, now) && p.images[0] && !p.images[0].placeholder);
	const slides: HeroSlide[] = [
		{
			kicker: 'Merchandise resmi Indah Expres',
			title: 'Pakai bangga, pesan bersama',
			text: 'Pre-order khusus mitra Indah Expres. Produk diproduksi saat target tercapai. Kalau tidak tercapai, dana kembali 100%.',
			cta: { href: '/shop/katalog', label: 'Lihat katalog' },
			cta2: { href: '/shop/info/cara-kerja-po', label: 'Cara kerja PO' },
			images: [
				{ src: '/katalog/kaos-pria.jpg', alt: 'Mitra Indah Expres memakai kaos putih berlogo oranye' },
				{ src: '/katalog/kemeja-panjang-wanita.jpg', alt: 'Staf Indah Expres memakai kemeja putih beraksen oranye' }
			],
			tone: 'brand'
		},
		...featured.slice(0, 3).map((p, i): HeroSlide => {
			const reached = poPhase(p.batch, now) === 'reached';
			return {
				kicker: reached
					? `Target tercapai — pasti diproduksi`
					: `PO ditutup ${fmtDayLong(p.batch!.closesAt)}`,
				title: p.name,
				text: p.summary,
				meta: `${rupiah(p.price)} · ${p.batch!.collected}/${p.batch!.target} pcs terkumpul`,
				cta: { href: `/shop/produk/${p.slug}`, label: 'Pesan sekarang' },
				images: p.images
					.filter((im) => !im.placeholder)
					.slice(0, 2)
					.map((im) => ({ src: im.src, alt: im.alt })),
				tone: i % 2 === 0 ? 'ink' : 'brand'
			};
		})
	];

	return {
		slides,
		closingSoon: sortProducts(orderable, 'segera', now).slice(0, 8),
		latest: sortProducts(all, 'terbaru', now).slice(0, 8)
	};
};

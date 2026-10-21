import { getDb } from '$lib/server/db';
import { listProducts, sortProducts } from '$lib/server/shop/catalog';
import { getLang } from '$lib/server/shop/lang';
import { fmtDayLong, rupiah } from '$lib/shop/format';
import { translate } from '$lib/shop/i18n';
import { isOrderable, poPhase } from '$lib/shop/po';
import type { HeroSlide } from '$lib/components/shop/HeroSlider.svelte';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const db = getDb();
	const now = Date.now();
	const lang = getLang(cookies);
	const tr = (key: Parameters<typeof translate>[1], vars?: Record<string, string | number>) => translate(lang, key, vars);
	const all = listProducts(db, { lang });
	const orderable = all.filter((p) => isOrderable(p.batch, now));

	const featured = all.filter((p) => isOrderable(p.batch, now) && p.images[0] && !p.images[0].placeholder);
	const slides: HeroSlide[] = [
		{
			kicker: tr('hero.introKicker'),
			title: tr('hero.introTitle'),
			text: tr('hero.introText'),
			cta: { href: '/shop/katalog', label: tr('hero.introCta') },
			cta2: { href: '/shop/info/cara-kerja-po', label: tr('hero.introCta2') },
			images: [
				{ src: '/katalog/kaos-pria.jpg', alt: tr('hero.altKaos') },
				{ src: '/katalog/kemeja-panjang-wanita.jpg', alt: tr('hero.altKemeja') }
			]
		},
		...featured.slice(0, 3).map((p): HeroSlide => {
			const reached = poPhase(p.batch, now) === 'reached';
			return {
				kicker: reached ? tr('hero.reached') : tr('hero.closes', { date: fmtDayLong(p.batch!.closesAt, lang) }),
				title: p.name,
				text: p.summary,
				meta: tr('hero.meta', { price: rupiah(p.price), n: p.batch!.collected, target: p.batch!.target }),
				cta: { href: `/shop/produk/${p.slug}`, label: tr('hero.cta') },
				images: p.images
					.filter((im) => !im.placeholder)
					.slice(0, 2)
					.map((im) => ({ src: im.src, alt: im.alt }))
			};
		})
	];

	const closingSoon = sortProducts(orderable, 'segera', now);
	// Banner Flash PO: PO tercepat ditutup, utamakan yang sudah punya foto
	const flash = closingSoon.find((p) => p.images[0] && !p.images[0].placeholder) ?? closingSoon[0] ?? null;

	return {
		slides,
		flash,
		closingSoon: closingSoon.slice(0, 8),
		latest: sortProducts(all, 'terbaru', now).slice(0, 8)
	};
};

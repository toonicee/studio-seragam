<script lang="ts" module>
	/** Ikon garis 24×24 (gaya Lucide) untuk pola latar: kaos, topi, tas, mug, tumbler, gantungan kunci, kartu e-money */
	const ICONS: Record<string, string[]> = {
		shirt: [
			'M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z'
		],
		cap: [
			'M2 14a8 7 0 0 1 16 0Z',
			'M10 7c-2 2-2.8 4.4-2.8 7',
			'M10 7c2 2 2.8 4.4 2.8 7',
			'M8 14h12.5a2 2 0 0 1 0 4H10a2 2 0 0 1-2-2Z'
		],
		bag: ['M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z', 'M3 6h18', 'M16 10a4 4 0 0 1-8 0'],
		mug: [
			'M10 2v2',
			'M14 2v2',
			'M6 2v2',
			'M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1'
		],
		cup: [
			'm6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8',
			'M5 8h14',
			'M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0',
			'm12 8 1-6h2'
		],
		key: [
			'm15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4',
			'm21 2-9.6 9.6',
			'M2 15.5a5.5 5.5 0 1 0 11 0a5.5 5.5 0 1 0-11 0'
		],
		card: [
			'M4.5 5h15a2.5 2.5 0 0 1 2.5 2.5v9a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 16.5v-9A2.5 2.5 0 0 1 4.5 5Z',
			'M6 9h2.5a1 1 0 0 1 1 1v1.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1Z',
			'M14.5 10a2.2 2.2 0 0 1 0 4',
			'M17 8.5a4.2 4.2 0 0 1 0 7',
			'M5 15.5h4'
		]
	};
	/** Satu petak pola 480×440 px yang diulang; ukuran ikon tetap di HP maupun layar lebar */
	const TILE = [
		{ icon: 'shirt', x: 75, y: 70, rotate: -14 },
		{ icon: 'mug', x: 245, y: 62, rotate: 10 },
		{ icon: 'key', x: 410, y: 92, rotate: -8 },
		{ icon: 'card', x: 160, y: 218, rotate: 16 },
		{ icon: 'bag', x: 330, y: 232, rotate: -12 },
		{ icon: 'cup', x: 72, y: 366, rotate: 8 },
		{ icon: 'cap', x: 250, y: 376, rotate: -18 },
		{ icon: 'shirt', x: 420, y: 350, rotate: 12 }
	].map((it, i) => ({ ...it, paths: ICONS[it.icon], scale: 3.6 + (i % 3) * 0.3, peach: i % 3 === 1 }));
</script>

<script lang="ts">
	import { t } from '$lib/shop/i18n.svelte';
</script>

<!-- Banner cerita "Dibuat sesuai pesanan": latar oranye berpola ikon merchandise + kartu putih -->
<section class="relative overflow-hidden bg-brand">
	<svg class="absolute inset-0 size-full" aria-hidden="true">
		<defs>
			<pattern id="mto-pattern" width="480" height="440" patternUnits="userSpaceOnUse">
				{#each TILE as it, i (i)}
					<g
						transform="translate({it.x} {it.y}) rotate({it.rotate}) scale({it.scale}) translate(-12 -12)"
						fill="none"
						stroke={it.peach ? '#ffd8c2' : '#ffffff'}
						stroke-width="1.4"
						stroke-linecap="round"
						stroke-linejoin="round"
						opacity="0.9"
					>
						{#each it.paths as d (d)}<path {d} />{/each}
					</g>
				{/each}
			</pattern>
		</defs>
		<rect width="100%" height="100%" fill="url(#mto-pattern)" />
	</svg>

	<div class="relative mx-auto max-w-7xl px-4 py-20 md:py-24">
		<div class="max-w-[560px] rounded-2xl bg-white p-7 shadow-[0_24px_60px_-24px_rgba(23,32,42,0.55)] md:p-10 lg:ml-[6%]">
			<h2 class="font-ui text-[30px] leading-tight font-bold tracking-tight text-ink md:text-[44px]">{t('story.title')}</h2>
			<p class="mt-4 text-base leading-relaxed text-ink md:mt-6 md:text-lg">{t('story.text')}</p>
			<a
				href="/shop/katalog"
				class="mt-6 inline-flex h-12 items-center rounded-lg bg-brand px-7 font-ui font-bold text-white transition-colors hover:bg-brand-strong md:mt-8"
			>
				{t('story.cta')}
			</a>
		</div>
	</div>
</section>

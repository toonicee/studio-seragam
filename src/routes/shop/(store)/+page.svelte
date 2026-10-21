<script lang="ts">
	import type { PageProps } from './$types';
	import HeroSlider from '$lib/components/shop/HeroSlider.svelte';
	import UspStrip from '$lib/components/shop/UspStrip.svelte';
	import ProductRail from '$lib/components/shop/ProductRail.svelte';
	import CategoryTiles from '$lib/components/shop/CategoryTiles.svelte';
	import FlashBanner from '$lib/components/shop/FlashBanner.svelte';
	import SectionHeading from '$lib/components/shop/SectionHeading.svelte';
	import Palette from '@lucide/svelte/icons/palette';
	import { t } from '$lib/shop/i18n.svelte';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{t('meta.homeTitle')}</title>
	<meta name="description" content={t('meta.homeDesc')} />
</svelte:head>

<!-- Banner utama selebar layar -->
<div class="mt-3 md:mt-4">
	<HeroSlider slides={data.slides} />
</div>

<div class="mx-auto max-w-7xl space-y-14 px-4 pt-5 md:space-y-20 md:pt-6">
	<UspStrip />

	{#if data.closingSoon.length}
		<ProductRail
			title={t('home.closing')}
			subtitle={t('home.closingSub')}
			href="/shop/katalog?urut=segera"
			products={data.closingSoon}
			now={data.now}
		/>
	{/if}

	<section>
		<SectionHeading title={t('home.categories')} href="/shop/katalog" linkLabel={t('common.allProducts')} />
		<CategoryTiles categories={data.categories} />
	</section>

	{#if data.flash}
		<FlashBanner product={data.flash} now={data.now} />
	{/if}

	<ProductRail title={t('home.latest')} href="/shop/katalog?urut=terbaru" products={data.latest} now={data.now} />

	<section class="grid overflow-hidden rounded-lg bg-ink text-white md:grid-cols-[1.2fr_1fr]">
		<div class="flex flex-col justify-center gap-4 p-8 md:p-12">
			<p class="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-brand uppercase">
				<Palette class="size-4" /> Studio Seragam
			</p>
			<h2 class="display text-[34px] md:text-[44px]">{t('home.studioTitle')}</h2>
			<p class="max-w-md text-white/70">{t('home.studioText')}</p>
			<a
				href="/"
				data-sveltekit-reload
				class="inline-flex h-12 w-fit items-center rounded-md bg-brand px-6 font-semibold text-white hover:bg-brand-strong"
			>
				{t('home.studioCta')}
			</a>
		</div>
		<img
			src="/shop-img/rompi-depan.webp"
			alt={t('home.studioAlt')}
			width="1000"
			height="1250"
			loading="lazy"
			class="hidden h-full max-h-[420px] w-full bg-surface object-cover md:block"
		/>
	</section>
</div>

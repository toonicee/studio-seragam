<script lang="ts">
	import type { PageProps } from './$types';
	import HeroSlider from '$lib/components/shop/HeroSlider.svelte';
	import ProductRail from '$lib/components/shop/ProductRail.svelte';
	import FlashBanner from '$lib/components/shop/FlashBanner.svelte';
	import CollectionsCollage from '$lib/components/shop/CollectionsCollage.svelte';
	import MadeToOrderBanner from '$lib/components/shop/MadeToOrderBanner.svelte';
	import { t } from '$lib/shop/i18n.svelte';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{t('meta.homeTitle')}</title>
	<meta name="description" content={t('meta.homeDesc')} />
</svelte:head>

<!-- Banner utama selebar layar, di bawah menu kategori -->
<HeroSlider slides={data.slides} />

<!-- Deretan produk selebar layar (kartu memanjang sampai tepi kanan) -->
<div class="space-y-14 pt-10 md:space-y-20 md:pt-16">
	<ProductRail simple title={t('home.newest')} href="/shop/katalog?urut=terbaru" products={data.latest} now={data.now} />

	<CollectionsCollage />

	<MadeToOrderBanner />

	{#if data.closingSoon.length}
		<ProductRail
			title={t('home.closing')}
			subtitle={t('home.closingSub')}
			href="/shop/katalog?urut=segera"
			products={data.closingSoon}
			now={data.now}
		/>
	{/if}

	{#if data.flash}
		<div class="mx-auto max-w-7xl px-4">
			<FlashBanner product={data.flash} now={data.now} />
		</div>
	{/if}
</div>

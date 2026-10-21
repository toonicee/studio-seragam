<script lang="ts">
	import type { PageProps } from './$types';
	import HeroSlider from '$lib/components/shop/HeroSlider.svelte';
	import UspStrip from '$lib/components/shop/UspStrip.svelte';
	import ProductRail from '$lib/components/shop/ProductRail.svelte';
	import CategoryTiles from '$lib/components/shop/CategoryTiles.svelte';
	import HowItWorks from '$lib/components/shop/HowItWorks.svelte';
	import SectionHeading from '$lib/components/shop/SectionHeading.svelte';
	import Palette from '@lucide/svelte/icons/palette';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Toko Merchandise Indah Expres — Pre-order khusus mitra</title>
	<meta
		name="description"
		content="Merchandise resmi Indah Expres untuk mitra: kaos, kemeja, polo, topi, tas, dan tumbler. Sistem pre-order, bayar QRIS, dana kembali 100% jika target tidak tercapai."
	/>
</svelte:head>

<div class="mx-auto max-w-7xl space-y-14 px-4 pt-4 md:space-y-20 md:pt-6">
	<div class="space-y-4">
		<HeroSlider slides={data.slides} />
		<UspStrip />
	</div>

	{#if data.closingSoon.length}
		<ProductRail
			title="PO segera ditutup"
			subtitle="Urut dari tanggal tutup terdekat. Pesan sebelum 23:59 WIB."
			href="/shop/katalog?urut=segera"
			products={data.closingSoon}
			now={data.now}
		/>
	{/if}

	<section>
		<SectionHeading title="Belanja per kategori" href="/shop/katalog" linkLabel="Semua produk" />
		<CategoryTiles categories={data.categories} />
	</section>

	<HowItWorks />

	<ProductRail title="Produk terbaru" href="/shop/katalog?urut=terbaru" products={data.latest} now={data.now} />

	<section class="grid overflow-hidden rounded-lg bg-ink text-white md:grid-cols-[1.2fr_1fr]">
		<div class="flex flex-col justify-center gap-4 p-8 md:p-12">
			<p class="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-brand uppercase">
				<Palette class="size-4" /> Studio Seragam
			</p>
			<h2 class="display text-[34px] md:text-[44px]">Butuh seragam kustom untuk tim?</h2>
			<p class="max-w-md text-white/70">
				Atur warna, pola, dan logo seragam dalam tampilan 3D, lalu hitung jumlah per ukuran dan kirim pesanan.
			</p>
			<a
				href="/"
				data-sveltekit-reload
				class="inline-flex h-12 w-fit items-center rounded-md bg-brand px-6 font-semibold text-white hover:bg-brand-strong"
			>
				Buka Studio Seragam
			</a>
		</div>
		<img
			src="/shop-img/rompi-depan.webp"
			alt="Render 3D rompi Indah Expres dari Studio Seragam"
			width="1000"
			height="1250"
			loading="lazy"
			class="hidden h-full max-h-[420px] w-full bg-surface object-cover md:block"
		/>
	</section>
</div>

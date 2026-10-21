<script lang="ts">
	import { onMount } from 'svelte';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { t } from '$lib/shop/i18n.svelte';
	import type { ProductCardView } from '$lib/shop/types';
	import ProductCard from './ProductCard.svelte';
	import ProductTile from './ProductTile.svelte';

	/**
	 * Deretan produk yang bisa digeser (gaya fanshop): judul besar, panah di kanan atas,
	 * kartu mulai sejajar isi halaman dan memanjang sampai tepi kanan layar.
	 * Pasang di luar container halaman (section ini selebar layar).
	 * `simple` = kartu ringkas (foto, nama, harga); tanpa itu kartu lengkap dengan info PO.
	 */
	let {
		title,
		subtitle = '',
		href = '',
		products,
		now,
		simple = false
	}: { title: string; subtitle?: string; href?: string; products: ProductCardView[]; now: number; simple?: boolean } =
		$props();

	let track: HTMLDivElement;
	let atStart = $state(true);
	let atEnd = $state(false);

	function update() {
		atStart = track.scrollLeft <= 4;
		atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
	}
	const scroll = (dir: number) => track.scrollBy({ left: dir * track.clientWidth * 0.75, behavior: 'smooth' });

	onMount(() => {
		update();
		const ro = new ResizeObserver(update);
		ro.observe(track);
		return () => ro.disconnect();
	});

	const arrow =
		'grid size-10 place-items-center rounded-lg bg-muted text-ink transition-colors hover:bg-ink/10 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-muted';
</script>

<section>
	<div class="mx-auto flex max-w-7xl items-end justify-between gap-4 px-4">
		<div class="min-w-0">
			<h2 class="font-ui text-[26px] leading-tight font-bold tracking-tight text-ink md:text-[40px]">{title}</h2>
			{#if subtitle}<p class="mt-1.5 text-sm text-muted-foreground md:text-base">{subtitle}</p>{/if}
		</div>
		<div class="flex shrink-0 items-center gap-4">
			{#if href}
				<a {href} class="text-sm font-semibold text-brand underline-offset-4 hover:underline">{t('common.seeAll')} →</a>
			{/if}
			<div class="hidden items-center gap-2 md:flex">
				<button type="button" class={arrow} disabled={atStart} onclick={() => scroll(-1)} aria-label={t('rail.left')}>
					<ChevronLeft class="size-5" />
				</button>
				<button type="button" class={arrow} disabled={atEnd} onclick={() => scroll(1)} aria-label={t('rail.right')}>
					<ChevronRight class="size-5" />
				</button>
			</div>
		</div>
	</div>

	<!-- Padding kiri/kanan = jarak tepi layar ke isi halaman (max-w-7xl), jadi kartu pertama sejajar judul -->
	<div
		bind:this={track}
		onscroll={update}
		class="mt-6 flex snap-x snap-mandatory scroll-px-[max(1rem,calc((100%-80rem)/2+1rem))] gap-4 overflow-x-auto px-[max(1rem,calc((100%-80rem)/2+1rem))] pb-2 scrollbar-none md:mt-8 md:gap-6 [&::-webkit-scrollbar]:hidden"
	>
		{#each products as p (p.id)}
			<div class="w-[70%] shrink-0 snap-start sm:w-[44%] md:w-[36%] lg:w-[27%]">
				{#if simple}
					<ProductTile product={p} />
				{:else}
					<ProductCard product={p} {now} />
				{/if}
			</div>
		{/each}
	</div>
</section>

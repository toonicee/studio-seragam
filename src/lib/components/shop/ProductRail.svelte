<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { t } from '$lib/shop/i18n.svelte';
	import type { ProductCardView } from '$lib/shop/types';
	import ProductCard from './ProductCard.svelte';
	import SectionHeading from './SectionHeading.svelte';

	let {
		title,
		subtitle = '',
		href = '',
		products,
		now
	}: { title: string; subtitle?: string; href?: string; products: ProductCardView[]; now: number } = $props();

	let track: HTMLDivElement;
	const scroll = (dir: number) => track.scrollBy({ left: dir * track.clientWidth * 0.85, behavior: 'smooth' });
</script>

<section>
	<SectionHeading {title} {subtitle} {href} />
	<div class="group/rail relative">
		<div
			bind:this={track}
			class="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:gap-5 [&::-webkit-scrollbar]:hidden"
		>
			{#each products as p (p.id)}
				<div class="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[calc(25%-15px)]">
					<ProductCard product={p} {now} />
				</div>
			{/each}
		</div>
		{#if products.length > 4}
			<button
				type="button"
				onclick={() => scroll(-1)}
				class="absolute top-[38%] -left-4 hidden size-11 place-items-center rounded-full border bg-white shadow-md transition hover:text-brand lg:grid"
				aria-label={t('rail.left')}
			>
				<ChevronLeft class="size-5" />
			</button>
			<button
				type="button"
				onclick={() => scroll(1)}
				class="absolute top-[38%] -right-4 hidden size-11 place-items-center rounded-full border bg-white shadow-md transition hover:text-brand lg:grid"
				aria-label={t('rail.right')}
			>
				<ChevronRight class="size-5" />
			</button>
		{/if}
	</div>
</section>

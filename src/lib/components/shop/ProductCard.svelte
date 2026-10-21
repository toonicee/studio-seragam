<script lang="ts">
	import { rupiah } from '$lib/shop/format';
	import { poPhase } from '$lib/shop/po';
	import type { ProductCardView } from '$lib/shop/types';
	import PoBadge from './PoBadge.svelte';
	import PoProgress from './PoProgress.svelte';

	let { product, now, eager = false }: { product: ProductCardView; now: number; eager?: boolean } = $props();

	const phase = $derived(poPhase(product.batch, now));
	const [first, second] = $derived(product.images);
	const isPhoto = (src: string) => src.endsWith('.jpg');
</script>

<a href="/shop/produk/{product.slug}" class="group block h-full rounded-md outline-offset-4">
	<div class="relative aspect-[4/5] overflow-hidden rounded-md bg-surface">
		{#if first}
			<img
				src={first.src}
				alt={first.alt}
				width="800"
				height="1000"
				loading={eager ? 'eager' : 'lazy'}
				decoding="async"
				class="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.03]"
				style:object-position={isPhoto(first.src) ? 'center 18%' : 'center'}
				style:scale={first.zoom}
			/>
		{/if}
		{#if second && !second.placeholder}
			<img
				src={second.src}
				alt=""
				aria-hidden="true"
				width="800"
				height="1000"
				loading="lazy"
				decoding="async"
				class="absolute inset-0 hidden size-full object-cover opacity-0 transition duration-500 group-hover:opacity-100 md:block"
				style:object-position={isPhoto(second.src) ? 'center 18%' : 'center'}
				style:scale={second.zoom}
			/>
		{/if}
		<PoBadge {phase} class="absolute top-2.5 left-2.5" />
		{#if first?.placeholder}
			<span class="absolute top-2.5 right-2.5 rounded-[3px] bg-white/90 px-2 py-1 text-[11px] font-medium text-muted-foreground">
				Foto menyusul
			</span>
		{/if}
	</div>
	<div class="pt-3">
		<p class="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">{product.category.name}</p>
		<h3 class="mt-0.5 line-clamp-2 leading-snug font-semibold group-hover:text-brand">{product.name}</h3>
		<p class="mt-1 font-display text-xl leading-none font-bold">{rupiah(product.price)}</p>
		<PoProgress batch={product.batch} {now} class="mt-3" />
	</div>
</a>

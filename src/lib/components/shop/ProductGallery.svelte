<script lang="ts">
	import { onMount } from 'svelte';
	import type { ProductImage } from '$lib/shop/types';
	import { cn } from '$lib/utils';

	let { images, name }: { images: ProductImage[]; name: string } = $props();

	let el: HTMLElement & { swiper?: { slideTo: (i: number) => void } };
	let active = $state(0);
	const isPhoto = (src: string) => src.endsWith('.jpg');

	onMount(() => {
		let cancelled = false;
		const onChange = (e: Event) => {
			active = (e as CustomEvent<[{ activeIndex: number }]>).detail[0].activeIndex;
		};
		import('swiper/element/bundle').then(({ register }) => {
			if (cancelled) return;
			register();
			Object.assign(el, {
				slidesPerView: 1,
				speed: 400,
				pagination: images.length > 1 ? { clickable: true } : false,
				navigation: images.length > 1,
				keyboard: { enabled: true },
				a11y: { prevSlideMessage: 'Foto sebelumnya', nextSlideMessage: 'Foto berikutnya' },
				injectStyles: [
					`.swiper-pagination-bullet{width:8px;height:8px;background:#17202a;opacity:.25}
					 .swiper-pagination-bullet-active{opacity:1;background:#e35a12}
					 .swiper-button-prev,.swiper-button-next{width:42px;height:42px;border-radius:999px;background:rgba(255,255,255,.95);color:#17202a;box-shadow:0 2px 10px rgba(0,0,0,.1)}
					 .swiper-button-prev svg,.swiper-button-next svg{width:12px;height:12px}
					 @media (max-width:767px){.swiper-button-prev,.swiper-button-next{display:none}}`
				]
			});
			(el as unknown as { initialize: () => void }).initialize();
			el.addEventListener('swiperslidechange', onChange);
		});
		return () => {
			cancelled = true;
			el?.removeEventListener('swiperslidechange', onChange);
		};
	});
</script>

<div class="min-w-0 lg:sticky lg:top-36">
	<swiper-container bind:this={el} init="false" class="block overflow-hidden rounded-lg bg-surface">
		{#each images as img, i (img.src)}
			<swiper-slide>
				<div class="relative overflow-hidden">
					<img
						src={img.src}
						alt={img.alt || name}
						width="1000"
						height="1250"
						loading={i === 0 ? 'eager' : 'lazy'}
						fetchpriority={i === 0 ? 'high' : 'auto'}
						class="aspect-[4/5] w-full object-cover"
						style:object-position={isPhoto(img.src) ? 'center 12%' : 'center'}
						style:scale={img.zoom}
					/>
					{#if img.placeholder}
						<span class="absolute top-3 right-3 rounded-[3px] bg-white/90 px-2.5 py-1 text-xs font-medium text-muted-foreground">
							Foto menyusul
						</span>
					{/if}
				</div>
			</swiper-slide>
		{/each}
	</swiper-container>

	{#if images.length > 1}
		<div class="mt-3 hidden gap-3 md:flex">
			{#each images as img, i (img.src)}
				<button
					type="button"
					onclick={() => el.swiper?.slideTo(i)}
					aria-label="Lihat foto {i + 1}"
					aria-current={active === i ? 'true' : undefined}
					class={cn(
						'w-20 overflow-hidden rounded-md bg-surface ring-offset-2 transition',
						active === i ? 'ring-2 ring-brand' : 'opacity-70 hover:opacity-100'
					)}
				>
					<img
						src={img.src}
						alt=""
						width="80"
						height="100"
						loading="lazy"
						class="aspect-[4/5] w-full object-cover"
						style:object-position={isPhoto(img.src) ? 'center 12%' : 'center'}
						style:scale={img.zoom}
					/>
				</button>
			{/each}
		</div>
	{/if}
</div>

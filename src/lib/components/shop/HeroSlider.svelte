<script lang="ts" module>
	export interface HeroSlide {
		kicker: string;
		title: string;
		text: string;
		cta: { href: string; label: string };
		cta2?: { href: string; label: string };
		images: { src: string; alt: string }[];
		meta?: string;
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/shop/i18n.svelte';
	import { cn } from '$lib/utils';

	let { slides }: { slides: HeroSlide[] } = $props();
	let el: HTMLElement;

	const isPhoto = (src: string) => src.endsWith('.jpg');

	onMount(() => {
		let cancelled = false;
		import('swiper/element/bundle').then(({ register }) => {
			if (cancelled) return;
			register();
			Object.assign(el, {
				slidesPerView: 1,
				loop: slides.length > 1,
				speed: 650,
				autoplay: { delay: 6500, disableOnInteraction: false, pauseOnMouseEnter: true },
				pagination: { clickable: true },
				navigation: true,
				a11y: { prevSlideMessage: t('hero.prev'), nextSlideMessage: t('hero.next') },
				injectStyles: [
					`.swiper-pagination{bottom:16px!important}
					 .swiper-pagination-bullet{width:28px;height:4px;border-radius:2px;background:#17202a;opacity:.18}
					 .swiper-pagination-bullet-active{opacity:1;background:#e35a12}
					 @media (min-width:768px){.swiper-pagination{width:auto!important;left:max(16px,calc((100vw - 1280px)/2 + 16px))!important;bottom:26px!important}}
					 .swiper-button-prev,.swiper-button-next{width:44px;height:44px;border-radius:999px;background:#fff;color:#17202a;box-shadow:0 2px 12px rgba(0,0,0,.14)}
					 .swiper-button-prev svg,.swiper-button-next svg{width:12px;height:12px}
					 @media (max-width:1279px){.swiper-button-prev,.swiper-button-next{display:none}}`
				]
			});
			(el as unknown as { initialize: () => void }).initialize();
		});
		return () => {
			cancelled = true;
		};
	});
</script>

<!-- Banner penuh selebar layar: latar putih, judul oranye, foto di kanan -->
<swiper-container bind:this={el} init="false" class="hero block bg-white">
	{#each slides as s, i (i)}
		<swiper-slide>
			<div class="grid h-full bg-white md:min-h-[500px] md:grid-cols-2">
				<div class="order-2 flex md:order-1">
					<div class="ml-auto flex w-full max-w-[640px] flex-col justify-center px-4 pt-7 pb-14 md:py-16 md:pr-12">
						<p class="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">{s.kicker}</p>
						<h2 class="display mt-3 text-[42px] text-brand md:text-[68px]">{s.title}</h2>
						<p class="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft md:text-base">{s.text}</p>
						{#if s.meta}
							<p class="mt-3 text-sm font-semibold text-ink">{s.meta}</p>
						{/if}
						<div class="mt-7 flex flex-wrap gap-3">
							<a
								href={s.cta.href}
								class="inline-flex h-12 items-center rounded-md bg-brand px-6 font-semibold text-white transition hover:bg-brand-strong"
							>
								{s.cta.label}
							</a>
							{#if s.cta2}
								<a
									href={s.cta2.href}
									class="inline-flex h-12 items-center rounded-md border border-brand px-6 font-semibold text-brand transition hover:bg-brand-soft"
								>
									{s.cta2.label}
								</a>
							{/if}
						</div>
					</div>
				</div>
				<div class="relative order-1 grid aspect-[4/3] grid-flow-col bg-surface md:order-2 md:aspect-auto">
					{#each s.images as img, j (j)}
						<img
							src={img.src}
							alt={img.alt}
							width="800"
							height="1000"
							loading={i === 0 ? 'eager' : 'lazy'}
							class={cn('size-full min-h-0 object-cover', j > 0 && 'hidden sm:block')}
							style:object-position={isPhoto(img.src) ? 'center 12%' : 'center'}
						/>
					{/each}
				</div>
			</div>
		</swiper-slide>
	{/each}
</swiper-container>

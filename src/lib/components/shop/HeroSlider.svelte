<script lang="ts" module>
	export interface HeroSlide {
		kicker: string;
		title: string;
		text: string;
		cta: { href: string; label: string };
		cta2?: { href: string; label: string };
		images: { src: string; alt: string }[];
		tone: 'brand' | 'ink';
		meta?: string;
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
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
				a11y: { prevSlideMessage: 'Slide sebelumnya', nextSlideMessage: 'Slide berikutnya' },
				injectStyles: [
					`.swiper-pagination{bottom:14px!important}
					 .swiper-pagination-bullet{width:28px;height:4px;border-radius:2px;background:#fff;opacity:.45}
					 .swiper-pagination-bullet-active{opacity:1}
					 .swiper-button-prev,.swiper-button-next{width:44px;height:44px;border-radius:999px;background:rgba(255,255,255,.92);color:#17202a;box-shadow:0 2px 10px rgba(0,0,0,.12)}
					 .swiper-button-prev svg,.swiper-button-next svg{width:12px;height:12px}
					 @media (max-width:767px){.swiper-button-prev,.swiper-button-next{display:none}}`
				]
			});
			(el as unknown as { initialize: () => void }).initialize();
		});
		return () => {
			cancelled = true;
		};
	});
</script>

<swiper-container bind:this={el} init="false" class="hero block overflow-hidden rounded-lg">
	{#each slides as s, i (i)}
		<swiper-slide>
			<div class="grid h-full md:min-h-[440px] md:grid-cols-[1.05fr_1fr]">
				<div
					class={cn(
						'order-2 flex flex-col justify-center px-6 pt-7 pb-12 text-white md:order-1 md:px-12 md:py-12',
						s.tone === 'brand' ? 'bg-brand' : 'bg-ink'
					)}
				>
					<p class="text-xs font-bold tracking-[0.2em] uppercase opacity-80">{s.kicker}</p>
					<h2 class="display mt-3 text-[40px] md:text-[64px]">{s.title}</h2>
					<p class="mt-4 max-w-md text-[15px] leading-relaxed text-white/85 md:text-base">{s.text}</p>
					{#if s.meta}
						<p class="mt-3 text-sm font-semibold">{s.meta}</p>
					{/if}
					<div class="mt-6 flex flex-wrap gap-3">
						<a
							href={s.cta.href}
							class="inline-flex h-12 items-center rounded-md bg-white px-6 font-semibold text-ink transition hover:bg-white/90"
						>
							{s.cta.label}
						</a>
						{#if s.cta2}
							<a
								href={s.cta2.href}
								class="inline-flex h-12 items-center rounded-md border border-white/60 px-6 font-semibold text-white transition hover:bg-white/10"
							>
								{s.cta2.label}
							</a>
						{/if}
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

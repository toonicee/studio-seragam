<script lang="ts" module>
	export interface HeroSlide {
		kicker: string;
		/** Ikon label atas: merek, tanggal tutup PO, atau target tercapai */
		icon?: 'brand' | 'clock' | 'check';
		title: string;
		text: string;
		cta: { href: string; label: string };
		cta2?: { href: string; label: string };
		images: { src: string; alt: string; zoom?: number }[];
		/** Slide produk: harga dan progres PO */
		po?: { price: string; collected: number; target: number };
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import BadgeCheck from '@lucide/svelte/icons/badge-check';
	import CalendarClock from '@lucide/svelte/icons/calendar-clock';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { t } from '$lib/shop/i18n.svelte';
	import { progress } from '$lib/shop/po';
	import { cn } from '$lib/utils';

	type SwiperApi = { realIndex: number; slidePrev(): void; slideNext(): void; slideToLoop(i: number): void };

	let { slides }: { slides: HeroSlide[] } = $props();
	let el: HTMLElement;
	let swiper = $state<SwiperApi | null>(null);
	let active = $state(0);

	const ICONS = { brand: Sparkles, clock: CalendarClock, check: BadgeCheck };
	const isPhoto = (src: string) => src.endsWith('.jpg');

	onMount(() => {
		let cancelled = false;
		// Swiper juga memicu event ini saat slide dilepas dari halaman (pindah halaman), di tengah pembaruan Svelte.
		// Mengubah state di saat itu dilarang Svelte dan menggagalkan navigasi, jadi pembaruannya ditunda sebentar.
		const onChange = () =>
			queueMicrotask(() => {
				if (!cancelled && swiper) active = swiper.realIndex;
			});
		el.addEventListener('swiperslidechange', onChange);
		import('swiper/element/bundle').then(({ register }) => {
			if (cancelled) return;
			register();
			const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
			Object.assign(el, {
				slidesPerView: 1,
				loop: slides.length > 1,
				speed: 650,
				autoplay: calm ? false : { delay: 6500, disableOnInteraction: false, pauseOnMouseEnter: true }
			});
			(el as unknown as { initialize: () => void }).initialize();
			swiper = (el as unknown as { swiper: SwiperApi }).swiper;
		});
		return () => {
			cancelled = true;
			el.removeEventListener('swiperslidechange', onChange);
		};
	});
</script>

<!-- Banner penuh selebar layar: latar putih, judul oranye, foto di kanan.
     Layar lebar: tingginya mengisi sisa layar di bawah bar atas + header + menu kategori
     (176px di md, 178px di lg; ubah angka ini bila tinggi bagian itu berubah) -->
<div class="relative bg-white">
	<swiper-container
		bind:this={el}
		init="false"
		class="hero block md:h-[calc(100svh-176px)] md:max-h-240 md:min-h-130 lg:h-[calc(100svh-178px)]"
	>
		{#each slides as s, i (i)}
			{@const Icon = ICONS[s.icon ?? 'brand']}
			{@const p = s.po ? progress(s.po.collected, s.po.target) : null}
			<swiper-slide>
				<div class="grid h-full grid-rows-[auto_1fr] md:grid-cols-2 md:grid-rows-1">
					<!-- Teks: tepi kirinya sejajar dengan isi halaman (max-w-7xl) -->
					<div class="order-2 flex md:order-1">
						<div class="flex w-full max-w-160 flex-col px-4 pt-6 pb-16 md:ml-auto md:justify-center md:py-14 md:pr-12">
							<p class="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 font-ui text-[13px] font-semibold text-brand-strong">
								<Icon class="size-4" />
								{s.kicker}
							</p>
							<h2 class="display mt-4 text-[38px] text-brand sm:text-[46px] lg:text-[64px] xl:text-[72px]">{s.title}</h2>
							<p class="mt-3 max-w-lg text-[17px] leading-relaxed text-ink md:mt-4 md:text-lg">{s.text}</p>
							{#if s.po && p}
								<div class="mt-5 flex items-center gap-5">
									<span class="font-display text-[32px] leading-none font-bold text-ink md:text-4xl">{s.po.price}</span>
									<div class="w-36 md:w-44">
										<div class="h-1.5 overflow-hidden rounded-full bg-muted">
											<div class="h-full rounded-full bg-brand" style:width="{p.pct}%"></div>
										</div>
										<p class="mt-1.5 font-ui text-xs font-semibold text-ink-soft">
											{t('po.collected', { n: s.po.collected, target: s.po.target })}
										</p>
									</div>
								</div>
							{/if}
							<div class="mt-6 flex flex-wrap gap-3 md:mt-8">
								<a
									href={s.cta.href}
									class="inline-flex h-12 items-center rounded-md bg-brand px-6 font-ui font-bold text-white transition-colors hover:bg-brand-strong"
								>
									{s.cta.label}
								</a>
								{#if s.cta2}
									<a
										href={s.cta2.href}
										class="inline-flex h-12 items-center rounded-md border-2 border-brand px-6 font-ui font-bold text-brand transition-colors hover:bg-brand-soft"
									>
										{s.cta2.label}
									</a>
								{/if}
							</div>
						</div>
					</div>
					<!-- Foto: setengah kanan sampai tepi layar; di HP di atas teks -->
					<div class="order-1 grid aspect-[4/3] grid-flow-col bg-surface md:order-2 md:aspect-auto">
						{#each s.images as img, j (j)}
							<div class={cn('relative overflow-hidden', j > 0 && 'hidden sm:block')}>
								<img
									src={img.src}
									alt={img.alt}
									width="800"
									height="1000"
									loading={i === 0 ? 'eager' : 'lazy'}
									class="absolute inset-0 size-full object-cover"
									style:object-position={isPhoto(img.src) ? 'center 12%' : 'center'}
									style:scale={img.zoom}
								/>
							</div>
						{/each}
					</div>
				</div>
			</swiper-slide>
		{/each}
	</swiper-container>

	{#if slides.length > 1}
		<!-- Kontrol slide. HP: di bawah teks. Layar lebar: pojok kanan bawah di atas foto -->
		<div class="pointer-events-none absolute inset-x-0 bottom-5 z-10 md:bottom-6">
			<div class="mx-auto flex max-w-7xl items-center gap-2 px-4 md:justify-end">
				<div class="pointer-events-auto flex items-center md:h-10 md:rounded-full md:bg-white/90 md:px-2 md:shadow-sm md:backdrop-blur">
					{#each slides as _, i (i)}
						<button
							type="button"
							class="group grid h-8 place-items-center px-1"
							aria-label={t('hero.goTo', { n: i + 1 })}
							aria-current={active === i ? 'true' : undefined}
							onclick={() => swiper?.slideToLoop(i)}
						>
							<span
								class={cn(
									'block h-1 rounded-full transition-all duration-300',
									active === i ? 'w-8 bg-brand' : 'w-4 bg-ink/20 group-hover:bg-ink/40'
								)}
							></span>
						</button>
					{/each}
				</div>
				<div class="pointer-events-auto hidden items-center gap-2 md:flex">
					<button
						type="button"
						class="grid size-10 place-items-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur transition-colors hover:bg-white hover:text-brand"
						aria-label={t('hero.prev')}
						onclick={() => swiper?.slidePrev()}
					>
						<ChevronLeft class="size-5" />
					</button>
					<button
						type="button"
						class="grid size-10 place-items-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur transition-colors hover:bg-white hover:text-brand"
						aria-label={t('hero.next')}
						onclick={() => swiper?.slideNext()}
					>
						<ChevronRight class="size-5" />
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

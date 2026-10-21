<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { t } from '$lib/shop/i18n.svelte';
	import { cn } from '$lib/utils';

	/**
	 * "Langsung ke Koleksi": kolase tiga kartu foto bertumpuk (layar lebar) / kotak berjajar (HP & tablet).
	 * Koleksi diarahkan ke pencarian supaya tetap jalan walau produk diganti admin.
	 */
	type Card = {
		href: string;
		label: string;
		images: string[];
		/** Posisi di kolase layar lebar, persen dari lebar/tinggi kolase */
		pos: { left: number; top: number; width: number; height: number };
		labelRight?: boolean;
		/** Pudarkan sisi kiri karena judul besar menumpang di atasnya */
		fade?: boolean;
	};

	const cards = $derived<Card[]>([
		{
			href: '/shop/cari?q=kemeja',
			label: t('collections.office'),
			images: ['/katalog/kemeja-pendek-pria.jpg', '/katalog/kemeja-pendek-wanita.jpg'],
			pos: { left: 37.8, top: 0, width: 62.2, height: 45.3 },
			labelRight: true,
			fade: true
		},
		{
			href: '/shop/cari?q=kaos',
			label: t('collections.tees'),
			images: ['/katalog/kaos-pria.jpg', '/katalog/kaos-wanita.jpg'],
			pos: { left: 9.5, top: 22.8, width: 53.3, height: 59.5 }
		},
		{
			href: '/shop/cari?q=rompi',
			label: t('collections.field'),
			images: ['/shop-img/rompi-depan.webp'],
			pos: { left: 56.8, top: 43.1, width: 33.2, height: 45.8 }
		}
	]);

	const position = (src: string) => (src.endsWith('.jpg') ? 'center 15%' : 'center 40%');
</script>

{#snippet card(c: Card, cls: string, style: string, desktop: boolean)}
	<a
		href={c.href}
		{style}
		class={cn(
			'group block overflow-hidden rounded-2xl bg-surface outline-none focus-visible:ring-4 focus-visible:ring-brand/40',
			cls
		)}
	>
		<span class="absolute inset-0 flex">
			{#each c.images as src (src)}
				<img
					{src}
					alt=""
					width="848"
					height="1264"
					loading="lazy"
					decoding="async"
					class="h-full min-w-0 flex-1 object-cover transition duration-700 group-hover:scale-[1.04]"
					style:object-position={position(src)}
				/>
			{/each}
		</span>
		{#if desktop && c.fade}
			<span class="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white/85 to-transparent"></span>
		{/if}
		<span class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/65 via-black/20 to-transparent"></span>
		<span
			class={cn(
				'absolute bottom-0 flex items-center gap-[0.35em] font-ui leading-none font-bold text-white',
				desktop ? 'p-[5%] text-[clamp(1.375rem,2.9cqw,2.5rem)]' : 'p-4 text-xl sm:p-5 sm:text-2xl',
				c.labelRight ? 'right-0' : 'left-0'
			)}
		>
			{c.label}
			<ChevronRight class="size-[1em] shrink-0 transition-transform group-hover:translate-x-1" strokeWidth={2.25} />
		</span>
	</a>
{/snippet}

<section class="mx-auto max-w-7xl px-4">
	<!-- Layar lebar: kolase bertumpuk; ukuran huruf ikut lebar kolase (cqw) -->
	<div class="@container relative hidden aspect-[1520/1213] lg:block">
		<h2 class="absolute top-0 left-0 z-30 grid justify-items-center font-ui leading-[0.95] font-bold tracking-tight text-ink">
			<span class="text-[4.1cqw]">{t('collections.kicker')}</span>
			<span class="text-[8.2cqw]">{t('collections.title')}</span>
		</h2>
		{#each cards as c, i (c.href)}
			{@render card(
				c,
				cn('absolute', i > 0 && 'shadow-[0_24px_60px_-28px_rgba(23,32,42,0.6)]'),
				`left:${c.pos.left}%;top:${c.pos.top}%;width:${c.pos.width}%;height:${c.pos.height}%;z-index:${i * 10}`,
				true
			)}
		{/each}
		<p class="absolute top-[90%] left-[9.5%] w-[42%] text-lg leading-relaxed text-ink">{t('collections.text')}</p>
	</div>

	<!-- HP & tablet: judul, satu kartu lebar, dua kartu berdampingan -->
	<div class="lg:hidden">
		<h2 class="inline-grid justify-items-center font-ui leading-[0.95] font-bold tracking-tight text-ink">
			<span class="text-[28px] sm:text-[36px]">{t('collections.kicker')}</span>
			<span class="text-[64px] sm:text-[84px]">{t('collections.title')}</span>
		</h2>
		<div class="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
			{#each cards as c, i (c.href)}
				{@render card(c, cn('relative', i === 0 ? 'col-span-2 aspect-[16/10]' : 'aspect-[3/4]'), '', false)}
			{/each}
		</div>
		<p class="mt-5 text-base leading-relaxed text-ink">{t('collections.text')}</p>
	</div>
</section>

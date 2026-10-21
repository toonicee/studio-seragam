<script lang="ts">
	import { onMount } from 'svelte';
	import Zap from '@lucide/svelte/icons/zap';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import { rupiah } from '$lib/shop/format';
	import { t } from '$lib/shop/i18n.svelte';
	import { progress } from '$lib/shop/po';
	import type { ProductCardView } from '$lib/shop/types';

	/** Banner promosi "Flash PO": produk yang PO-nya paling cepat ditutup, dengan hitung mundur */
	let { product, now }: { product: ProductCardView; now: number } = $props();

	let current = $state(0);
	onMount(() => {
		current = Date.now();
		const timer = setInterval(() => (current = Date.now()), 1000);
		return () => clearInterval(timer);
	});

	const closesAt = $derived(product.batch?.closesAt ?? 0);
	const left = $derived(Math.max(0, closesAt - (current || now)));
	const parts = $derived([
		{ value: Math.floor(left / 86_400_000), label: t('flash.days') },
		{ value: Math.floor((left % 86_400_000) / 3_600_000), label: t('flash.hours') },
		{ value: Math.floor((left % 3_600_000) / 60_000), label: t('flash.minutes') },
		{ value: Math.floor((left % 60_000) / 1000), label: t('flash.seconds') }
	]);
	const p = $derived(product.batch ? progress(product.batch.collected, product.batch.target) : null);
	const image = $derived(product.images.find((i) => !i.placeholder) ?? product.images[0]);
	const pad = (n: number) => String(n).padStart(2, '0');
</script>

<section class="grid overflow-hidden rounded-2xl bg-brand text-white md:grid-cols-[1.35fr_1fr]" aria-label={t('flash.kicker')}>
	<div class="flex flex-col justify-center gap-5 p-6 md:p-10">
		<p class="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-[0.18em] uppercase">
			<Zap class="size-3.5 fill-current" />
			{t('flash.kicker')}
		</p>
		<div>
			<h2 class="display text-[34px] md:text-[48px]">{t('flash.title')}</h2>
			<p class="mt-2 text-lg font-semibold">
				{product.name} · <span class="font-display text-2xl">{rupiah(product.price)}</span>
			</p>
		</div>

		<div>
			<p class="text-xs font-semibold tracking-wider text-white/75 uppercase">{t('flash.endsIn')}</p>
			<ol class="mt-2 flex items-start gap-2" aria-live="off">
				{#each parts as part, i (i)}
					<li class="grid w-16 justify-items-center rounded-lg bg-white py-2 text-brand shadow-sm md:w-[72px]">
						<span class="font-display text-3xl leading-none font-bold tabular-nums md:text-4xl">{pad(part.value)}</span>
						<span class="mt-1 text-[11px] font-semibold text-ink-soft uppercase">{part.label}</span>
					</li>
				{/each}
			</ol>
		</div>

		{#if p && product.batch}
			<div class="max-w-sm">
				<div class="h-2 overflow-hidden rounded-full bg-white/25">
					<div class="h-full rounded-full bg-white" style:width="{p.pct}%"></div>
				</div>
				<p class="mt-1.5 text-sm text-white/85">{t('flash.collected', { n: product.batch.collected, target: product.batch.target })}</p>
			</div>
		{/if}

		<a
			href="/shop/produk/{product.slug}"
			class="inline-flex h-12 w-fit items-center gap-2 rounded-md bg-white px-6 font-semibold text-brand transition hover:bg-brand-soft"
		>
			{t('flash.cta')}
			<ArrowRight class="size-4" />
		</a>
	</div>

	{#if image}
		<a href="/shop/produk/{product.slug}" class="relative block min-h-[260px] bg-surface md:min-h-full" tabindex="-1" aria-hidden="true">
			<img
				src={image.src}
				alt=""
				width="800"
				height="1000"
				loading="lazy"
				class="absolute inset-0 size-full object-cover"
				style:object-position={image.src.endsWith('.jpg') ? 'center 15%' : 'center 28%'}
			/>
		</a>
	{/if}
</section>

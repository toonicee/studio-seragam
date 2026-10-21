<script lang="ts">
	import ProductCard from '$lib/components/shop/ProductCard.svelte';
	import SearchX from '@lucide/svelte/icons/search-x';
	import { t, tn } from '$lib/shop/i18n.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>{data.q ? t('search.meta', { q: data.q }) : t('search.title')} — {t('meta.suffix')}</title></svelte:head>

<div class="mx-auto max-w-7xl px-4 pt-8">
	<h1 class="display text-[36px] md:text-[48px]">{data.q ? t('search.results', { q: data.q }) : t('search.title')}</h1>
	{#if data.results.length}
		<p class="mt-6 text-sm text-muted-foreground">{tn('common.products', data.results.length)}</p>
		<ul class="mt-4 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
			{#each data.results as p (p.id)}
				<li><ProductCard product={p} now={data.now} /></li>
			{/each}
		</ul>
	{:else if data.q}
		<div class="mt-10 grid justify-items-center gap-3 rounded-lg border border-dashed py-16 text-center">
			<SearchX class="size-10 text-muted-foreground/60" />
			<p class="font-medium">{t('search.none')}</p>
			<a href="/shop/katalog" class="text-sm font-semibold text-brand hover:underline">{t('search.all')}</a>
		</div>
	{/if}
</div>

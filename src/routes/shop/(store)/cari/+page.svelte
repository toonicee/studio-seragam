<script lang="ts">
	import ProductCard from '$lib/components/shop/ProductCard.svelte';
	import SearchX from '@lucide/svelte/icons/search-x';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>{data.q ? `Cari “${data.q}”` : 'Cari produk'} — Toko Indah Expres</title></svelte:head>

<div class="mx-auto max-w-7xl px-4 pt-8">
	<h1 class="display text-[36px] md:text-[48px]">{data.q ? `Hasil untuk “${data.q}”` : 'Cari produk'}</h1>
	<form method="GET" class="mt-4 flex max-w-xl gap-2">
		<input name="q" type="search" value={data.q} placeholder="Cari kaos, kemeja, topi…" aria-label="Cari produk" class="h-11 flex-1 rounded-md border border-input px-3 outline-none focus:border-brand focus:ring-3 focus:ring-brand/15" />
		<button class="h-11 rounded-md bg-ink px-5 font-semibold text-white">Cari</button>
	</form>
	{#if data.results.length}
		<p class="mt-6 text-sm text-muted-foreground">{data.results.length} produk</p>
		<ul class="mt-4 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
			{#each data.results as p (p.id)}
				<li><ProductCard product={p} now={data.now} /></li>
			{/each}
		</ul>
	{:else if data.q}
		<div class="mt-10 grid justify-items-center gap-3 rounded-lg border border-dashed py-16 text-center">
			<SearchX class="size-10 text-muted-foreground/60" />
			<p class="font-medium">Tidak ada produk yang cocok</p>
			<a href="/shop/katalog" class="text-sm font-semibold text-brand hover:underline">Lihat semua produk</a>
		</div>
	{/if}
</div>

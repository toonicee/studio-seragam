<script lang="ts">
	import { page } from '$app/state';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import ProductCard from '$lib/components/shop/ProductCard.svelte';
	import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
	import PackageOpen from '@lucide/svelte/icons/package-open';
	import { cn } from '$lib/utils';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const title = $derived(data.category?.name ?? 'Semua Produk');
	const base = $derived(data.category ? `/shop/katalog/${data.category.slug}` : '/shop/katalog');

	/** Link yang mempertahankan filter lain di URL */
	function withParams(path: string, patch: Record<string, string | null>) {
		const sp = new URLSearchParams(page.url.searchParams.toString());
		for (const [k, v] of Object.entries(patch)) {
			if (v === null || v === '' || (k === 'status' && v === 'semua') || (k === 'urut' && v === 'segera')) sp.delete(k);
			else sp.set(k, v);
		}
		const q = sp.toString();
		return q ? `${path}?${q}` : path;
	}

	const chip = (active: boolean) =>
		cn(
			'inline-flex h-9 shrink-0 items-center rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors',
			active ? 'border-ink bg-ink text-white' : 'border-border bg-white hover:border-ink/40'
		);
</script>

<svelte:head>
	<title>{title} — Toko Indah Expres</title>
	<meta
		name="description"
		content={data.category?.description ?? 'Semua merchandise resmi Indah Expres dengan sistem pre-order khusus mitra.'}
	/>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 pt-6">
	<Breadcrumb.Root>
		<Breadcrumb.List>
			<Breadcrumb.Item><Breadcrumb.Link href="/shop">Beranda</Breadcrumb.Link></Breadcrumb.Item>
			<Breadcrumb.Separator />
			{#if data.category}
				<Breadcrumb.Item><Breadcrumb.Link href="/shop/katalog">Katalog</Breadcrumb.Link></Breadcrumb.Item>
				<Breadcrumb.Separator />
				<Breadcrumb.Item><Breadcrumb.Page>{data.category.name}</Breadcrumb.Page></Breadcrumb.Item>
			{:else}
				<Breadcrumb.Item><Breadcrumb.Page>Katalog</Breadcrumb.Page></Breadcrumb.Item>
			{/if}
		</Breadcrumb.List>
	</Breadcrumb.Root>

	<header class="mt-4 flex flex-col gap-2 border-b pb-6 md:flex-row md:items-end md:justify-between">
		<div>
			<h1 class="display text-[40px] md:text-[56px]">{title}</h1>
			<p class="mt-2 max-w-xl text-muted-foreground">
				{data.category?.description ?? 'Semua merchandise resmi Indah Expres. Dijual pre-order khusus mitra.'}
			</p>
		</div>
		<p class="text-sm text-muted-foreground">{data.total} produk</p>
	</header>

	<!-- Kategori -->
	<nav aria-label="Kategori" class="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
		<a href={withParams('/shop/katalog', {})} class={chip(!data.category)}>Semua</a>
		{#each data.categories as c (c.id)}
			<a href={withParams(`/shop/katalog/${c.slug}`, {})} class={chip(data.category?.slug === c.slug)}>
				{c.name}
			</a>
		{/each}
	</nav>

	<!-- Status & urutan -->
	<div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div class="-mx-4 flex items-center gap-1 overflow-x-auto px-4 [scrollbar-width:none]" role="group" aria-label="Status PO">
			<SlidersHorizontal class="mr-1 size-4 shrink-0 text-muted-foreground" />
			{#each Object.entries(data.statuses) as [key, label] (key)}
				<a
					href={withParams(base, { status: key })}
					aria-current={data.status === key ? 'true' : undefined}
					class={cn(
						'shrink-0 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap',
						data.status === key ? 'bg-brand-soft text-brand' : 'text-muted-foreground hover:text-foreground'
					)}
				>
					{label}
				</a>
			{/each}
		</div>
		<form method="GET" action={base} class="flex items-center gap-2 text-sm">
			{#if data.status !== 'semua'}<input type="hidden" name="status" value={data.status} />{/if}
			<label for="urut" class="text-muted-foreground">Urutkan</label>
			<select
				id="urut"
				name="urut"
				value={data.sort}
				onchange={(e) => e.currentTarget.form?.requestSubmit()}
				class="h-10 rounded-md border border-input bg-white px-3 pr-8 font-medium outline-none focus:border-brand focus:ring-3 focus:ring-brand/15"
			>
				{#each Object.entries(data.sorts) as [key, label] (key)}
					<option value={key}>{label}</option>
				{/each}
			</select>
			<noscript><button class="h-10 rounded-md border px-3">Terapkan</button></noscript>
		</form>
	</div>

	{#if data.products.length}
		<ul class="mt-6 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
			{#each data.products as p, i (p.id)}
				<li><ProductCard product={p} now={data.now} eager={i < 4} /></li>
			{/each}
		</ul>
	{:else}
		<div class="mt-10 grid justify-items-center gap-3 rounded-lg border border-dashed py-16 text-center">
			<PackageOpen class="size-10 text-muted-foreground/60" />
			<p class="font-medium">Belum ada produk dengan filter ini</p>
			<a href={base} class="text-sm font-semibold text-brand hover:underline">Hapus filter</a>
		</div>
	{/if}
</div>

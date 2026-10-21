<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import PoBadge from '$lib/components/shop/PoBadge.svelte';
	import PoProgress from '$lib/components/shop/PoProgress.svelte';
	import Plus from '@lucide/svelte/icons/plus';
	import { rupiah } from '$lib/shop/format';
	import { poPhase } from '$lib/shop/po';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Produk & PO — Admin Toko Indah Expres</title></svelte:head>

<PageHeader title="Produk & PO" description="Ubah produk, foto, harga, dan buka PO baru. Perubahan langsung tampil di toko.">
	{#snippet actions()}<Button href="/shop/admin/produk/baru"><Plus class="size-4" /> Tambah produk</Button>{/snippet}
</PageHeader>

<ul class="divide-y rounded-lg border bg-white">
	{#each data.products as p (p.id)}
		<li class="grid gap-3 p-4 sm:grid-cols-[64px_1fr_220px] sm:items-center">
			<a href="/shop/admin/produk/{p.id}" class="hidden sm:block">
				{#if p.image}<img src={p.image.src} alt="" class="h-20 w-16 rounded bg-surface object-cover" style:object-position={p.image.src.endsWith('.jpg') ? 'center 15%' : 'center'} />{/if}
			</a>
			<div>
				<a href="/shop/admin/produk/{p.id}" class="font-semibold hover:text-brand">{p.name}</a>
				<p class="text-sm text-muted-foreground">{p.categoryName} · {rupiah(p.price)}</p>
				<p class="mt-1 flex flex-wrap gap-1.5 text-[11px] font-semibold uppercase">
					{#if !p.active}<span class="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">Disembunyikan</span>{/if}
					{#if p.featured}<span class="rounded bg-brand-soft px-1.5 py-0.5 text-brand">Banner</span>{/if}
					{#if p.image?.placeholder}<span class="rounded bg-warning-soft px-1.5 py-0.5 text-warning">Foto menyusul</span>{/if}
				</p>
			</div>
			<div>
				{#if p.batch}
					<div class="mb-1.5 flex items-center justify-between gap-2">
						<PoBadge phase={poPhase(p.batch, data.now)} />
						<a href="/shop/admin/po/{p.batch.id}" class="text-xs font-medium text-brand hover:underline">Batch {p.batch.batchNo} →</a>
					</div>
					<PoProgress batch={p.batch} now={data.now} />
				{:else}
					<span class="text-sm text-muted-foreground">Belum ada PO</span>
				{/if}
			</div>
		</li>
	{/each}
</ul>

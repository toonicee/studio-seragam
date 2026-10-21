<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';
	import { Button } from '$lib/components/ui/button';
	import Minus from '@lucide/svelte/icons/minus';
	import Plus from '@lucide/svelte/icons/plus';
	import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
	import Check from '@lucide/svelte/icons/check';
	import ProductGallery from '$lib/components/shop/ProductGallery.svelte';
	import PoPanel from '$lib/components/shop/PoPanel.svelte';
	import SizeChart from '$lib/components/shop/SizeChart.svelte';
	import ProductCard from '$lib/components/shop/ProductCard.svelte';
	import SectionHeading from '$lib/components/shop/SectionHeading.svelte';
	import { cartUi } from '$lib/components/shop/cart-ui.svelte';
	import { MAX_QTY } from '$lib/shop/constants';
	import { fmtDay, fmtDeadline, rupiah } from '$lib/shop/format';
	import { PHASE_META, poPhase, shipEstimate } from '$lib/shop/po';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const product = $derived(data.product);
	const phase = $derived(poPhase(product.batch, data.now));
	const orderable = $derived(PHASE_META[phase].orderable);
	const needsSize = $derived(product.sizes.length > 0);

	let size = $state('');
	let qty = $state(1);
	let submitting = $state(false);

	const details = $derived(product.details.split('\n').filter(Boolean));
	const jsonLd = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'Product',
			name: product.name,
			description: product.summary || product.description,
			image: product.images.filter((i) => !i.placeholder).map((i) => i.src),
			brand: { '@type': 'Brand', name: 'Indah Expres' },
			offers: {
				'@type': 'Offer',
				priceCurrency: 'IDR',
				price: product.price,
				availability: orderable ? 'https://schema.org/PreOrder' : 'https://schema.org/OutOfStock'
			}
		}).replace(/</g, '\\u003c')
	);
</script>

<svelte:head>
	<title>{product.name} — Toko Indah Expres</title>
	<meta name="description" content={product.summary || product.description} />
	{@html `<script type="application/ld+json">${jsonLd}</` + 'script>'}
</svelte:head>

<div class="mx-auto max-w-7xl px-4 pt-6 pb-28 md:pb-0">
	<Breadcrumb.Root>
		<Breadcrumb.List>
			<Breadcrumb.Item><Breadcrumb.Link href="/shop">Beranda</Breadcrumb.Link></Breadcrumb.Item>
			<Breadcrumb.Separator />
			<Breadcrumb.Item>
				<Breadcrumb.Link href="/shop/katalog/{product.category.slug}">{product.category.name}</Breadcrumb.Link>
			</Breadcrumb.Item>
			<Breadcrumb.Separator />
			<Breadcrumb.Item><Breadcrumb.Page>{product.name}</Breadcrumb.Page></Breadcrumb.Item>
		</Breadcrumb.List>
	</Breadcrumb.Root>

	<div class="mt-5 grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-14">
		<ProductGallery images={product.images} name={product.name} />

		<div>
			<a href="/shop/katalog/{product.category.slug}" class="text-xs font-bold tracking-[0.18em] text-brand uppercase">
				{product.category.name}
			</a>
			<h1 class="display mt-2 text-[40px] md:text-[52px]">{product.name}</h1>
			<p class="mt-2 text-muted-foreground">{product.summary}</p>
			<p class="mt-4 font-display text-4xl font-bold">{rupiah(product.price)}</p>
			<p class="mt-1 text-xs text-muted-foreground">Harga per pcs, sudah termasuk logo. Belum termasuk ongkir.</p>

			<div class="mt-6">
				<PoPanel batch={product.batch} now={data.now} />
			</div>

			<form
				id="add-form"
				method="POST"
				action="?/add"
				class="mt-6 space-y-5"
				use:enhance={({ cancel }) => {
					if (needsSize && !size) {
						toast.error('Pilih ukuran dulu');
						cancel();
						return;
					}
					submitting = true;
					return async ({ result, update }) => {
						submitting = false;
						if (result.type === 'success') {
							await update({ reset: false });
							cartUi.open = true;
							toast.success(`${product.name}${size ? ` (${size})` : ''} masuk keranjang`);
						} else if (result.type === 'failure') {
							toast.error(String(result.data?.message ?? 'Gagal menambahkan ke keranjang'));
						} else {
							await update();
						}
					};
				}}
			>
				<input type="hidden" name="productId" value={product.id} />
				<input type="hidden" name="size" value={size} />

				{#if needsSize}
					<fieldset>
						<div class="mb-2 flex items-center justify-between">
							<legend class="text-sm font-semibold">Ukuran{size ? `: ${size}` : ''}</legend>
							{#if product.sizeChart.length}
								<SizeChart rows={product.sizeChart} name={product.name} />
							{/if}
						</div>
						<ToggleGroup.Root
							type="single"
							bind:value={size}
							variant="outline"
							spacing={2}
							class="flex flex-wrap gap-2"
							aria-label="Pilih ukuran"
							disabled={!orderable}
						>
							{#each product.sizes as s (s)}
								<ToggleGroup.Item
									value={s}
									class="h-11 min-w-14 rounded-md! border px-3 text-sm font-semibold data-[state=on]:border-ink data-[state=on]:bg-ink data-[state=on]:text-white"
								>
									{s}
								</ToggleGroup.Item>
							{/each}
						</ToggleGroup.Root>
					</fieldset>
				{:else}
					<p class="text-sm"><span class="font-semibold">Ukuran:</span> satu ukuran</p>
				{/if}

				<div class="flex items-end gap-3">
					<div>
						<label for="qty" class="mb-2 block text-sm font-semibold">Jumlah</label>
						<div class="flex h-12 items-center rounded-md border">
							<button type="button" class="grid h-full w-11 place-items-center hover:bg-muted disabled:opacity-40" aria-label="Kurangi" disabled={qty <= 1 || !orderable} onclick={() => (qty = Math.max(1, qty - 1))}>
								<Minus class="size-4" />
							</button>
							<input
								id="qty"
								name="qty"
								type="number"
								inputmode="numeric"
								min="1"
								max={MAX_QTY}
								bind:value={qty}
								disabled={!orderable}
								class="h-full w-12 border-x text-center font-semibold tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
							/>
							<button type="button" class="grid h-full w-11 place-items-center hover:bg-muted disabled:opacity-40" aria-label="Tambah" disabled={qty >= MAX_QTY || !orderable} onclick={() => (qty = Math.min(MAX_QTY, qty + 1))}>
								<Plus class="size-4" />
							</button>
						</div>
					</div>
					<Button type="submit" size="lg" class="h-12 flex-1 text-base font-semibold" disabled={!orderable || submitting}>
						<ShoppingBag class="size-5" />
						{orderable ? 'Pesan (PO)' : PHASE_META[phase].badge}
					</Button>
				</div>
				{#if orderable && product.batch}
					<ul class="grid gap-1.5 text-sm text-muted-foreground">
						<li class="flex gap-2"><Check class="mt-0.5 size-4 shrink-0 text-success" />Bayar lunas lewat QRIS, dana kembali 100% jika PO gagal</li>
						<li class="flex gap-2"><Check class="mt-0.5 size-4 shrink-0 text-success" />Pesan sebelum {fmtDeadline(product.batch.closesAt)}</li>
						<li class="flex gap-2"><Check class="mt-0.5 size-4 shrink-0 text-success" />Ukuran tidak bisa ditukar setelah PO ditutup</li>
					</ul>
				{/if}
			</form>

			<Tabs.Root value="deskripsi" class="mt-10">
				<Tabs.List variant="line" class="w-full justify-start gap-6 border-b">
					<Tabs.Trigger value="deskripsi" class="px-0 text-sm font-semibold">Deskripsi</Tabs.Trigger>
					<Tabs.Trigger value="detail" class="px-0 text-sm font-semibold">Detail produk</Tabs.Trigger>
					<Tabs.Trigger value="kirim" class="px-0 text-sm font-semibold">Pengiriman & PO</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="deskripsi" class="pt-4 leading-relaxed text-ink-soft">
					<p>{product.description}</p>
				</Tabs.Content>
				<Tabs.Content value="detail" class="pt-4">
					<ul class="grid gap-2 text-sm">
						{#each details as d (d)}
							<li class="flex gap-2.5"><span class="mt-2 size-1.5 shrink-0 rounded-full bg-brand"></span>{d}</li>
						{/each}
					</ul>
				</Tabs.Content>
				<Tabs.Content value="kirim" class="space-y-3 pt-4 text-sm leading-relaxed text-ink-soft">
					{#if product.batch}
						<p>
							PO ditutup <b>{fmtDeadline(product.batch.closesAt)}</b>. Jika target {product.batch.target} pcs tercapai,
							produk diproduksi sekitar {product.batch.productionDays} hari dan diperkirakan dikirim
							<b>{fmtDay(shipEstimate(product.batch.closesAt, product.batch.productionDays))}</b> lewat Indah Expres.
						</p>
					{/if}
					<p>Jika target tidak tercapai, pesanan dibatalkan dan dana dikembalikan 100%, termasuk kode unik.</p>
					<p>Pesanan berisi beberapa produk dikirim sekaligus setelah semuanya selesai diproduksi.</p>
					<a href="/shop/info/cara-kerja-po" class="inline-block font-semibold text-brand hover:underline">Cara kerja PO →</a>
				</Tabs.Content>
			</Tabs.Root>
		</div>
	</div>

	{#if data.related.length}
		<section class="mt-20">
			<SectionHeading title="Produk lainnya" href="/shop/katalog" linkLabel="Semua produk" />
			<ul class="grid grid-cols-2 gap-x-4 gap-y-9 md:gap-x-5 lg:grid-cols-4">
				{#each data.related as p (p.id)}
					<li><ProductCard product={p} now={data.now} /></li>
				{/each}
			</ul>
		</section>
	{/if}
</div>

<!-- Bar pesan di HP -->
{#if orderable}
	<div class="fixed inset-x-0 bottom-0 z-30 border-t bg-white px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] md:hidden">
		<div class="flex items-center gap-3">
			<div class="min-w-0 flex-1">
				<p class="truncate text-xs text-muted-foreground">{size ? `Ukuran ${size} · ${qty} pcs` : needsSize ? 'Pilih ukuran di atas' : `${qty} pcs`}</p>
				<p class="font-display text-2xl leading-none font-bold">{rupiah(product.price * qty)}</p>
			</div>
			<Button type="submit" form="add-form" size="lg" class="h-12 px-6 text-base font-semibold" disabled={submitting}>
				<ShoppingBag class="size-5" /> Pesan (PO)
			</Button>
		</div>
	</div>
{/if}

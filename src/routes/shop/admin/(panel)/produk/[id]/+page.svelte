<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '$app/forms';
	import { page } from '$app/state';
	import { superForm } from 'sveltekit-superforms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import ProductForm from '$lib/components/admin/ProductForm.svelte';
	import PoBadge from '$lib/components/shop/PoBadge.svelte';
	import PoProgress from '$lib/components/shop/PoProgress.svelte';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import ImagePlus from '@lucide/svelte/icons/image-plus';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import { fmtDeadline } from '$lib/shop/format';
	import { poPhase } from '$lib/shop/po';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	const sf = superForm(data.form, {
		resetForm: false,
		onUpdated: ({ form }) => form.message && toast.success(String(form.message))
	});
	// svelte-ignore state_referenced_locally
	const bf = superForm(data.batchForm, {
		resetForm: false,
		onUpdated: ({ form }) => {
			if (!form.message) return;
			if (form.valid) toast.success(String(form.message));
			else toast.error(String(form.message));
		}
	});
	const { form: batch, errors: batchErrors, enhance: batchEnhance, submitting: batchSubmitting } = bf;

	const openBatch = $derived(data.batches.find((b) => b.id === data.openBatchId) ?? null);
	let uploading = $state(false);

	const imageAction: SubmitFunction = () => {
		uploading = true;
		return async ({ result, update }) => {
			uploading = false;
			if (result.type === 'success') toast.success(String(result.data?.imageMessage ?? 'Tersimpan'));
			else if (result.type === 'failure') toast.error(String(result.data?.imageMessage ?? 'Gagal'));
			await update();
		};
	};
</script>

<svelte:head><title>{data.product.name} — Admin Toko Indah Expres</title></svelte:head>

<a href="/shop/admin/produk" class="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft class="size-4" /> Produk</a>
<PageHeader title={data.product.name} description={page.url.searchParams.has('baru') ? 'Produk dibuat. Lanjutkan dengan foto dan PO pertama.' : ''}>
	{#snippet actions()}
		<Button href="/shop/produk/{data.product.slug}" target="_blank" variant="outline"><ExternalLink class="size-4" /> Lihat di toko</Button>
	{/snippet}
</PageHeader>

<div class="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_380px]">
	<div class="space-y-8">
		<section>
			<h2 class="mb-3 font-display text-2xl font-bold uppercase">Foto</h2>
			<div class="rounded-lg border bg-white p-4">
				<ul class="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
					{#each data.product.images as img, i (img.src + i)}
						<li class="group relative">
							<img src={img.src} alt={img.alt} class="aspect-[4/5] w-full rounded-md bg-surface object-cover" style:object-position={img.src.endsWith('.jpg') ? 'center 15%' : 'center'} />
							{#if i === 0}<span class="absolute top-1.5 left-1.5 rounded bg-ink px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">Utama</span>{/if}
							{#if img.placeholder}<span class="absolute top-1.5 right-1.5 rounded bg-warning-soft px-1.5 py-0.5 text-[10px] font-bold text-warning uppercase">Sementara</span>{/if}
							<form method="POST" action="?/image" use:enhance={imageAction} class="mt-1.5 flex justify-center gap-1">
								<input type="hidden" name="index" value={i} />
								<button name="op" value="left" disabled={i === 0} class="grid size-7 place-items-center rounded border bg-white disabled:opacity-30" aria-label="Geser ke kiri"><ChevronLeft class="size-3.5" /></button>
								<button name="op" value="right" disabled={i === data.product.images.length - 1} class="grid size-7 place-items-center rounded border bg-white disabled:opacity-30" aria-label="Geser ke kanan"><ChevronRight class="size-3.5" /></button>
								<button name="op" value="remove" class="grid size-7 place-items-center rounded border bg-white text-destructive" aria-label="Hapus foto"><Trash2 class="size-3.5" /></button>
							</form>
						</li>
					{/each}
				</ul>
				<form method="POST" action="?/upload" enctype="multipart/form-data" use:enhance={imageAction} class="mt-4 flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center">
					<input name="images" type="file" accept="image/*" multiple class="flex-1 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium" />
					<Button type="submit" disabled={uploading}><ImagePlus class="size-4" /> {uploading ? 'Mengunggah…' : 'Unggah foto'}</Button>
				</form>
				<p class="mt-2 text-xs text-muted-foreground">Foto diperkecil otomatis (maks. 1600 px, WebP). Rasio 4:5 terlihat paling rapi. Foto asli menggantikan gambar sementara.</p>
			</div>
		</section>

		<section>
			<h2 class="mb-3 font-display text-2xl font-bold uppercase">Data produk</h2>
			<ProductForm {sf} categories={data.categories} action="?/save" />
		</section>
	</div>

	<aside class="space-y-6">
		<section class="rounded-lg border bg-white p-5">
			<h2 class="font-display text-2xl font-bold uppercase">{openBatch ? `PO batch ${openBatch.batchNo}` : 'Buka PO baru'}</h2>
			{#if openBatch}
				<div class="mt-3"><PoProgress batch={openBatch} now={data.now} size="lg" /></div>
				<p class="mt-2 text-xs text-muted-foreground">Ubah target atau perpanjang tanggal tutup bila perlu.</p>
			{:else}
				<p class="mt-1 text-sm text-muted-foreground">Tidak ada PO yang dibuka. Isi target dan tanggal tutup untuk membuka batch berikutnya.</p>
			{/if}
			<form method="POST" action="?/batch" use:batchEnhance class="mt-4 grid gap-3" novalidate>
				<div class="grid gap-1.5">
					<Label for="target">Target minimum (pcs, semua ukuran)</Label>
					<Input id="target" name="target" type="number" min="1" bind:value={$batch.target} aria-invalid={$batchErrors.target ? 'true' : undefined} />
					{#if $batchErrors.target}<p class="text-sm text-destructive">{$batchErrors.target}</p>{/if}
				</div>
				<div class="grid gap-1.5">
					<Label for="closeDate">Tanggal tutup (23:59 WIB)</Label>
					<Input id="closeDate" name="closeDate" type="date" bind:value={$batch.closeDate} aria-invalid={$batchErrors.closeDate ? 'true' : undefined} />
					{#if $batchErrors.closeDate}<p class="text-sm text-destructive">{$batchErrors.closeDate}</p>{/if}
				</div>
				<div class="grid gap-1.5">
					<Label for="bProductionDays">Lama produksi (hari)</Label>
					<Input id="bProductionDays" name="productionDays" type="number" min="1" bind:value={$batch.productionDays} />
				</div>
				<Button type="submit" disabled={$batchSubmitting}>{openBatch ? 'Simpan PO' : 'Buka PO'}</Button>
			</form>
		</section>

		{#if data.batches.length}
			<section class="rounded-lg border bg-white">
				<h2 class="border-b px-5 py-3 font-semibold">Riwayat PO</h2>
				<ul class="divide-y">
					{#each data.batches as b (b.id)}
						<li>
							<a href="/shop/admin/po/{b.id}" class="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-muted/40">
								<span>
									<span class="font-medium">Batch {b.batchNo}</span>
									<span class="block text-xs text-muted-foreground">{b.collected}/{b.target} pcs · tutup {fmtDeadline(b.closesAt)}</span>
								</span>
								<PoBadge phase={poPhase(b, data.now)} />
							</a>
						</li>
					{/each}
				</ul>
			</section>
		{/if}
	</aside>
</div>

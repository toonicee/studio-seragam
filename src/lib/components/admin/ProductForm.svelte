<script lang="ts">
	import type { SuperForm } from 'sveltekit-superforms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import type { z } from 'zod';
	import type { productSchema } from '$lib/shop/schemas';

	type Data = z.infer<typeof productSchema>;
	let {
		sf,
		categories,
		isNew = false,
		action = ''
	}: { sf: SuperForm<Data>; categories: { id: number; name: string }[]; isNew?: boolean; action?: string } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, submitting } = sf;
	// svelte-ignore state_referenced_locally
	let slugTouched = $state(!isNew);

	const slugify = (s: string) =>
		s
			.toLowerCase()
			.normalize('NFD')
			.replace(/[̀-ͯ]/g, '')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.slice(0, 80);
</script>

<form method="POST" {action} use:enhance class="space-y-6" novalidate>
	<section class="grid gap-4 rounded-lg border bg-white p-5 sm:grid-cols-2">
		<div class="grid gap-1.5 sm:col-span-2">
			<Label for="name">Nama produk</Label>
			<Input id="name" name="name" bind:value={$form.name} oninput={() => !slugTouched && ($form.slug = slugify($form.name))} aria-invalid={$errors.name ? 'true' : undefined} />
			{#if $errors.name}<p class="text-sm text-destructive">{$errors.name}</p>{/if}
		</div>
		<div class="grid gap-1.5">
			<Label for="slug">Slug (alamat halaman)</Label>
			<Input id="slug" name="slug" bind:value={$form.slug} oninput={() => (slugTouched = true)} aria-invalid={$errors.slug ? 'true' : undefined} />
			<p class="text-xs text-muted-foreground">/shop/produk/{$form.slug || '…'}</p>
			{#if $errors.slug}<p class="text-sm text-destructive">{$errors.slug}</p>{/if}
		</div>
		<div class="grid gap-1.5">
			<Label for="categoryId">Kategori</Label>
			<select id="categoryId" name="categoryId" bind:value={$form.categoryId} class="h-9 rounded-md border border-input bg-white px-3 text-sm">
				{#each categories as c (c.id)}<option value={c.id}>{c.name}</option>{/each}
			</select>
			{#if $errors.categoryId}<p class="text-sm text-destructive">{$errors.categoryId}</p>{/if}
		</div>
		<div class="grid gap-1.5">
			<Label for="price">Harga (Rp)</Label>
			<Input id="price" name="price" type="number" min="0" step="100" bind:value={$form.price} aria-invalid={$errors.price ? 'true' : undefined} />
			{#if $errors.price}<p class="text-sm text-destructive">{$errors.price}</p>{/if}
		</div>
		<div class="grid gap-1.5">
			<Label for="productionDays">Lama produksi standar (hari)</Label>
			<Input id="productionDays" name="productionDays" type="number" min="1" bind:value={$form.productionDays} />
			{#if $errors.productionDays}<p class="text-sm text-destructive">{$errors.productionDays}</p>{/if}
		</div>
		<div class="grid gap-1.5 sm:col-span-2">
			<Label for="summary">Ringkasan (1 kalimat, tampil di kartu & banner)</Label>
			<Input id="summary" name="summary" bind:value={$form.summary} />
		</div>
		<div class="grid gap-1.5 sm:col-span-2">
			<Label for="description">Deskripsi</Label>
			<Textarea id="description" name="description" rows={4} bind:value={$form.description} />
		</div>
		<div class="grid gap-1.5 sm:col-span-2">
			<Label for="details">Detail produk (satu poin per baris)</Label>
			<Textarea id="details" name="details" rows={4} bind:value={$form.details} placeholder={'Bahan Dri-Fit\nSablon DTF depan & belakang'} />
		</div>
	</section>

	<details class="group rounded-lg border bg-white p-5" open={!!($form.nameEn || $form.descriptionEn)}>
		<summary class="cursor-pointer font-semibold">
			Versi English <span class="font-normal text-muted-foreground">(opsional — kosong = pakai Bahasa Indonesia)</span>
		</summary>
		<div class="mt-4 grid gap-4 sm:grid-cols-2">
			<div class="grid gap-1.5">
				<Label for="nameEn">Nama produk (EN)</Label>
				<Input id="nameEn" name="nameEn" bind:value={$form.nameEn} />
			</div>
			<div class="grid gap-1.5">
				<Label for="summaryEn">Ringkasan (EN)</Label>
				<Input id="summaryEn" name="summaryEn" bind:value={$form.summaryEn} />
			</div>
			<div class="grid gap-1.5 sm:col-span-2">
				<Label for="descriptionEn">Deskripsi (EN)</Label>
				<Textarea id="descriptionEn" name="descriptionEn" rows={4} bind:value={$form.descriptionEn} />
			</div>
			<div class="grid gap-1.5 sm:col-span-2">
				<Label for="detailsEn">Detail produk (EN, satu poin per baris)</Label>
				<Textarea id="detailsEn" name="detailsEn" rows={4} bind:value={$form.detailsEn} />
			</div>
		</div>
	</details>

	<section class="grid gap-4 rounded-lg border bg-white p-5 sm:grid-cols-2">
		<div class="grid gap-1.5">
			<Label for="sizes">Ukuran</Label>
			<Input id="sizes" name="sizes" bind:value={$form.sizes} placeholder="S, M, L, XL — kosongkan untuk satu ukuran" />
			<p class="text-xs text-muted-foreground">Pisahkan dengan koma.</p>
		</div>
		<div class="grid gap-1.5">
			<Label for="sizeChart">Tabel ukuran (cm)</Label>
			<Textarea id="sizeChart" name="sizeChart" rows={4} bind:value={$form.sizeChart} placeholder={'M 69 52\nL 72 55'} class="font-mono text-sm" />
			<p class="text-xs text-muted-foreground">Satu baris per ukuran: ukuran, panjang badan, lebar dada.</p>
		</div>
	</section>

	<section class="flex flex-wrap items-center gap-6 rounded-lg border bg-white p-5">
		<label class="flex items-center gap-2 text-sm font-medium"><Checkbox name="active" bind:checked={$form.active} /> Tampil di toko</label>
		<label class="flex items-center gap-2 text-sm font-medium"><Checkbox name="featured" bind:checked={$form.featured} /> Tampil di banner beranda</label>
		<label class="flex items-center gap-2 text-sm font-medium">Urutan <Input name="sort" type="number" min="0" bind:value={$form.sort} class="h-9 w-20" /></label>
	</section>

	<Button type="submit" size="lg" disabled={$submitting}>{$submitting ? 'Menyimpan…' : isNew ? 'Simpan produk' : 'Simpan perubahan'}</Button>
</form>

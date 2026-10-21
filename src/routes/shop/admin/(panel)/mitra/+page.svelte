<script lang="ts">
	import { enhance } from '$app/forms';
	import { superForm } from 'sveltekit-superforms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Dialog from '$lib/components/ui/dialog';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import type { Column } from '$lib/components/admin/table';
	import Plus from '@lucide/svelte/icons/plus';
	import Upload from '@lucide/svelte/icons/upload';
	import { fmtPhone } from '$lib/shop/format';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	type Row = (typeof data.rows)[number];

	let editOpen = $state(false);
	let importOpen = $state(false);

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance: formEnhance, submitting, reset } = superForm(data.form, {
		resetForm: false,
		onUpdated: ({ form }) => {
			if (form.valid && form.message) {
				toast.success(String(form.message));
				editOpen = false;
			}
		}
	});

	function edit(r?: Row) {
		if (r) $form = { id: r.id, code: r.code, name: r.name, phone: fmtPhone(r.phone), city: r.city, active: r.active };
		else reset({ data: { id: 0, code: '', name: '', phone: '', city: '', active: true } });
		editOpen = true;
	}

	const columns: Column<Row>[] = [
		{ key: 'code', label: 'Kode', sort: (r) => r.code },
		{ key: 'name', label: 'Mitra', sort: (r) => r.name },
		{ key: 'orders', label: 'Pesanan lunas', sort: (r) => r.orders, class: 'text-right' },
		{ key: 'status', label: 'Status', sort: (r) => (r.active ? 0 : 1) },
		{ key: 'action', label: '', class: 'text-right' }
	];
</script>

<svelte:head><title>Mitra — Admin Toko Indah Expres</title></svelte:head>

<PageHeader title="Mitra" description="Hanya mitra aktif yang bisa checkout: kode mitra dan nomor WhatsApp harus cocok.">
	{#snippet actions()}
		<Button variant="outline" onclick={() => (importOpen = true)}><Upload class="size-4" /> Impor CSV</Button>
		<Button onclick={() => edit()}><Plus class="size-4" /> Tambah mitra</Button>
	{/snippet}
</PageHeader>

<DataTable rows={data.rows} {columns} search={(r) => `${r.code} ${r.name} ${r.phone} ${r.city}`} searchPlaceholder="Cari kode, nama, nomor…" empty="Belum ada mitra" rowClass={(r) => (r.active ? '' : 'opacity-60')}>
	{#snippet cell(r, c)}
		{#if c.key === 'code'}
			<span class="font-mono font-semibold">{r.code}</span>
		{:else if c.key === 'name'}
			<p class="font-medium">{r.name}</p>
			<p class="text-xs text-muted-foreground">{fmtPhone(r.phone)}{r.city ? ` · ${r.city}` : ''}</p>
		{:else if c.key === 'orders'}
			<span class="tabular-nums">{r.orders}</span>
		{:else if c.key === 'status'}
			<span class={r.active ? 'text-xs font-bold text-success uppercase' : 'text-xs font-bold text-muted-foreground uppercase'}>{r.active ? 'Aktif' : 'Nonaktif'}</span>
		{:else if c.key === 'action'}
			<div class="flex justify-end gap-2">
				<Button size="sm" variant="outline" onclick={() => edit(r)}>Ubah</Button>
				<form method="POST" action="?/toggle" use:enhance={() => async ({ result, update }) => {
					if (result.type === 'success') toast.success(String(result.data?.toast));
					await update();
				}}>
					<input type="hidden" name="id" value={r.id} />
					<input type="hidden" name="active" value={r.active ? '0' : '1'} />
					<Button size="sm" variant="ghost" type="submit">{r.active ? 'Nonaktifkan' : 'Aktifkan'}</Button>
				</form>
			</div>
		{/if}
	{/snippet}
</DataTable>

<Dialog.Root bind:open={editOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header><Dialog.Title>{$form.id ? 'Ubah mitra' : 'Tambah mitra'}</Dialog.Title></Dialog.Header>
		<form method="POST" action="?/save" use:formEnhance class="grid gap-3" novalidate>
			<input type="hidden" name="id" value={$form.id} />
			<div class="grid gap-1.5">
				<Label for="code">Kode mitra</Label>
				<Input id="code" name="code" bind:value={$form.code} class="font-mono uppercase" aria-invalid={$errors.code ? 'true' : undefined} />
				{#if $errors.code}<p class="text-sm text-destructive">{$errors.code}</p>{/if}
			</div>
			<div class="grid gap-1.5">
				<Label for="pname">Nama mitra / agen</Label>
				<Input id="pname" name="name" bind:value={$form.name} aria-invalid={$errors.name ? 'true' : undefined} />
				{#if $errors.name}<p class="text-sm text-destructive">{$errors.name}</p>{/if}
			</div>
			<div class="grid gap-1.5">
				<Label for="pphone">Nomor WhatsApp</Label>
				<Input id="pphone" name="phone" type="tel" bind:value={$form.phone} aria-invalid={$errors.phone ? 'true' : undefined} />
				{#if $errors.phone}<p class="text-sm text-destructive">{$errors.phone}</p>{/if}
			</div>
			<div class="grid gap-1.5">
				<Label for="pcity">Kota (opsional)</Label>
				<Input id="pcity" name="city" bind:value={$form.city} />
			</div>
			<label class="flex items-center gap-2 text-sm font-medium"><Checkbox name="active" bind:checked={$form.active} /> Aktif (boleh checkout)</label>
			<Button type="submit" disabled={$submitting}>Simpan</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={importOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Impor mitra dari CSV</Dialog.Title>
			<Dialog.Description>Kolom berurutan: <b>nama, kode, whatsapp, kota</b> (kota opsional). Baris judul boleh ada. Kode yang sudah ada akan diperbarui.</Dialog.Description>
		</Dialog.Header>
		<pre class="rounded-md bg-muted p-3 text-xs">nama,kode,whatsapp,kota
Agen Medan Kota,MDN-001,081234567890,Medan</pre>
		<form
			method="POST"
			action="?/import"
			enctype="multipart/form-data"
			class="grid gap-3"
			use:enhance={() => async ({ result, update }) => {
				if (result.type === 'success') {
					const r = result.data?.imported as { added: number; updated: number; skipped: string[] };
					toast.success(`${r.added} mitra baru, ${r.updated} diperbarui${r.skipped.length ? `, ${r.skipped.length} dilewati (${r.skipped.slice(0, 5).join(', ')})` : ''}`);
					importOpen = false;
				} else if (result.type === 'failure') toast.error(String(result.data?.importError ?? 'Gagal impor'));
				await update();
			}}
		>
			<input name="csv" type="file" accept=".csv,text/csv" required class="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-2" />
			<Button type="submit">Impor</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>

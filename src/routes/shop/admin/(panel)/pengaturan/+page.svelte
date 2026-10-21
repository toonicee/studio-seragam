<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '$app/forms';
	import { superForm } from 'sveltekit-superforms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Alert from '$lib/components/ui/alert';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import QrCode from '@lucide/svelte/icons/qr-code';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const notify = ({ form }: { form: { valid: boolean; message?: unknown } }) => {
		if (form.message) (form.valid ? toast.success : toast.error)(String(form.message));
	};
	// svelte-ignore state_referenced_locally
	const { form: sform, errors: serrors, enhance: senhance, submitting: ssubmitting } = superForm(data.settingsForm, { resetForm: false, onUpdated: notify });
	// svelte-ignore state_referenced_locally
	const { form: pform, errors: perrors, enhance: penhance, submitting: psubmitting } = superForm(data.passwordForm, { onUpdated: notify });

	const simple: SubmitFunction = () => async ({ result, update }) => {
		if (result.type === 'success') toast.success(String(result.data?.ok ?? 'Tersimpan'));
		else if (result.type === 'failure') toast.error(String(result.data?.message ?? 'Gagal'));
		await update({ reset: false });
	};
</script>

<svelte:head><title>Pengaturan — Admin Toko Indah Expres</title></svelte:head>

<PageHeader title="Pengaturan" description="Pembayaran QRIS, kontak admin, ongkir, halaman info, dan akun." />

{#if data.placeholderWa}
	<Alert.Root class="mb-6 border-warning/30 bg-warning-soft">
		<TriangleAlert class="text-warning" />
		<Alert.Title>Nomor WhatsApp admin masih contoh</Alert.Title>
		<Alert.Description>Ganti dengan nomor admin asli agar tombol WhatsApp di toko sampai ke admin.</Alert.Description>
	</Alert.Root>
{/if}

<Tabs.Root value="bayar">
	<Tabs.List class="mb-6 flex-wrap">
		<Tabs.Trigger value="bayar">Pembayaran & kontak</Tabs.Trigger>
		<Tabs.Trigger value="ongkir">Ongkir</Tabs.Trigger>
		<Tabs.Trigger value="halaman">Halaman info</Tabs.Trigger>
		<Tabs.Trigger value="akun">Akun</Tabs.Trigger>
	</Tabs.List>

	<Tabs.Content value="bayar" class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<section class="rounded-lg border bg-white p-5">
			<h2 class="font-semibold">QRIS statis GoPay Merchant</h2>
			<p class="mt-1 text-sm text-muted-foreground">Unduh gambar QRIS dari aplikasi GoPay Merchant, lalu unggah di sini. Gambar ini tampil di halaman bayar pembeli.</p>
			<div class="mt-4 flex flex-col gap-4 sm:flex-row">
				{#if data.qrisUrl}
					<img src={data.qrisUrl} alt="QRIS saat ini" class="w-40 rounded-md border bg-white object-contain" />
				{:else}
					<div class="grid size-40 place-content-center justify-items-center gap-1 rounded-md border-2 border-dashed text-xs text-muted-foreground"><QrCode class="size-8" />Belum ada</div>
				{/if}
				<form method="POST" action="?/qris" enctype="multipart/form-data" use:enhance={simple} class="flex flex-1 flex-col justify-end gap-2">
					<input name="qris" type="file" accept="image/*" required class="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-2" />
					<Button type="submit" class="w-fit">Unggah QRIS</Button>
				</form>
			</div>
		</section>

		<section class="rounded-lg border bg-white p-5">
			<h2 class="font-semibold">Toko & pembayaran</h2>
			<form method="POST" action="?/settings" use:senhance class="mt-4 grid gap-3" novalidate>
				<div class="grid gap-1.5">
					<Label for="merchantName">Nama merchant (di bawah QRIS)</Label>
					<Input id="merchantName" name="merchantName" bind:value={$sform.merchantName} />
					{#if $serrors.merchantName}<p class="text-sm text-destructive">{$serrors.merchantName}</p>{/if}
				</div>
				<div class="grid gap-1.5">
					<Label for="waAdmin">Nomor WhatsApp admin</Label>
					<Input id="waAdmin" name="waAdmin" type="tel" bind:value={$sform.waAdmin} />
					{#if $serrors.waAdmin}<p class="text-sm text-destructive">{$serrors.waAdmin}</p>{/if}
				</div>
				<div class="grid gap-1.5">
					<Label for="payWindowHours">Batas bayar setelah checkout (jam)</Label>
					<Input id="payWindowHours" name="payWindowHours" type="number" min="1" max="168" bind:value={$sform.payWindowHours} />
					<p class="text-xs text-muted-foreground">Tidak pernah melewati deadline PO. Pesanan yang tidak dibayar dibatalkan otomatis.</p>
					{#if $serrors.payWindowHours}<p class="text-sm text-destructive">{$serrors.payWindowHours}</p>{/if}
				</div>
				<Button type="submit" class="w-fit" disabled={$ssubmitting}>Simpan</Button>
			</form>
		</section>
	</Tabs.Content>

	<Tabs.Content value="ongkir" class="max-w-2xl space-y-4">
		<p class="text-sm text-muted-foreground">Pembeli memilih salah satu tarif aktif saat checkout. Tarif nonaktif tidak tampil.</p>
		{#each data.zones as z (z.id)}
			<form method="POST" action="?/zone" use:enhance={simple} class="grid gap-2 rounded-lg border bg-white p-4 sm:grid-cols-[1fr_140px_auto_auto] sm:items-center">
				<input type="hidden" name="id" value={z.id} />
				<Input name="name" value={z.name} aria-label="Nama tarif" />
				<Input name="fee" type="number" min="0" step="500" value={z.fee} aria-label="Ongkir (Rp)" />
				<label class="flex items-center gap-2 text-sm"><input type="checkbox" name="active" checked={z.active} class="size-4 accent-[var(--brand)]" /> Aktif</label>
				<Button type="submit" size="sm" variant="outline">Simpan</Button>
			</form>
		{/each}
		<form method="POST" action="?/zone" use:enhance={simple} class="grid gap-2 rounded-lg border border-dashed bg-white p-4 sm:grid-cols-[1fr_140px_auto] sm:items-center">
			<input type="hidden" name="id" value="0" />
			<input type="hidden" name="active" value="on" />
			<Input name="name" placeholder="Nama tarif baru, mis. Luar Pulau Sumatera" aria-label="Nama tarif baru" />
			<Input name="fee" type="number" min="0" step="500" placeholder="Rp" aria-label="Ongkir (Rp)" />
			<Button type="submit" size="sm">Tambah tarif</Button>
		</form>
	</Tabs.Content>

	<Tabs.Content value="halaman" class="space-y-6">
		{#each data.pages as p (p.slug)}
			<form method="POST" action="?/page" use:enhance={simple} class="grid gap-3 rounded-lg border bg-white p-5">
				<input type="hidden" name="slug" value={p.slug} />
				<div class="flex items-center justify-between gap-3">
					<Input name="title" value={p.title} class="max-w-sm font-semibold" aria-label="Judul halaman" />
					<a href="/shop/info/{p.slug}" target="_blank" class="inline-flex items-center gap-1 text-sm text-brand hover:underline">Lihat <ExternalLink class="size-3.5" /></a>
				</div>
				<Textarea name="body" value={p.body} rows={10} class="font-mono text-sm" aria-label="Isi halaman {p.title}" />
				<p class="text-xs text-muted-foreground">Format markdown: <code>## Judul</code>, <code>**tebal**</code>, daftar dengan <code>- </code> atau <code>1. </code>, link <code>[teks](https://…)</code>.</p>
				<Button type="submit" size="sm" class="w-fit">Simpan halaman</Button>
			</form>
		{/each}
	</Tabs.Content>

	<Tabs.Content value="akun" class="max-w-md">
		<form method="POST" action="?/password" use:penhance class="grid gap-3 rounded-lg border bg-white p-5" novalidate>
			<h2 class="font-semibold">Ganti kata sandi</h2>
			<div class="grid gap-1.5">
				<Label for="currentPassword">Kata sandi sekarang</Label>
				<Input id="currentPassword" name="currentPassword" type="password" autocomplete="current-password" bind:value={$pform.currentPassword} />
				{#if $perrors.currentPassword}<p class="text-sm text-destructive">{$perrors.currentPassword}</p>{/if}
			</div>
			<div class="grid gap-1.5">
				<Label for="newPassword">Kata sandi baru</Label>
				<Input id="newPassword" name="newPassword" type="password" autocomplete="new-password" bind:value={$pform.newPassword} />
				{#if $perrors.newPassword}<p class="text-sm text-destructive">{$perrors.newPassword}</p>{/if}
			</div>
			<div class="grid gap-1.5">
				<Label for="confirmPassword">Ulangi kata sandi baru</Label>
				<Input id="confirmPassword" name="confirmPassword" type="password" autocomplete="new-password" bind:value={$pform.confirmPassword} />
				{#if $perrors.confirmPassword}<p class="text-sm text-destructive">{$perrors.confirmPassword}</p>{/if}
			</div>
			<Button type="submit" class="w-fit" disabled={$psubmitting}>Ganti kata sandi</Button>
		</form>
	</Tabs.Content>
</Tabs.Root>

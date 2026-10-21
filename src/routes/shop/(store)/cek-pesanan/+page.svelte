<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import PackageSearch from '@lucide/svelte/icons/package-search';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, submitting, message } = superForm(data.form);
</script>

<svelte:head><title>Cek pesanan — Toko Indah Expres</title></svelte:head>

<div class="mx-auto max-w-md px-4 pt-12">
	<span class="grid size-12 place-items-center rounded-full bg-brand-soft text-brand"><PackageSearch class="size-6" /></span>
	<h1 class="display mt-4 text-[40px]">Cek pesanan</h1>
	<p class="mt-1 text-muted-foreground">Masukkan nomor pesanan (mis. IE-261021-0007) dan nomor WhatsApp yang dipakai saat checkout.</p>
	<form method="POST" use:enhance class="mt-6 space-y-4" novalidate>
		<div class="grid gap-1.5">
			<Label for="code">Nomor pesanan</Label>
			<Input id="code" name="code" bind:value={$form.code} autocapitalize="characters" class="h-11 uppercase" aria-invalid={$errors.code ? 'true' : undefined} />
			{#if $errors.code}<p class="text-sm text-destructive">{$errors.code}</p>{/if}
		</div>
		<div class="grid gap-1.5">
			<Label for="phone">Nomor WhatsApp</Label>
			<Input id="phone" name="phone" type="tel" inputmode="tel" bind:value={$form.phone} class="h-11" aria-invalid={$errors.phone ? 'true' : undefined} />
			{#if $errors.phone}<p class="text-sm text-destructive">{$errors.phone}</p>{/if}
		</div>
		{#if $message}<p class="rounded-md bg-destructive/5 p-3 text-sm text-destructive">{$message}</p>{/if}
		<Button type="submit" size="lg" class="h-12 w-full font-semibold" disabled={$submitting}>Lihat pesanan</Button>
	</form>
</div>

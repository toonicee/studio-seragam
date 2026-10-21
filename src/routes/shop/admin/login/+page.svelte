<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import ShopLogo from '$lib/components/shop/ShopLogo.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, submitting, message } = superForm(data.form);
</script>

<svelte:head>
	<title>Masuk admin — Toko Indah Expres</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="grid min-h-dvh place-items-center bg-surface px-4">
	<div class="w-full max-w-sm">
		<div class="mb-6 flex justify-center"><ShopLogo /></div>
		<form method="POST" use:enhance class="space-y-4 rounded-lg border bg-white p-6 shadow-sm" novalidate>
			<div>
				<h1 class="font-display text-2xl font-bold uppercase">Admin toko</h1>
				<p class="text-sm text-muted-foreground">Masuk untuk mengelola produk, PO, dan pembayaran.</p>
			</div>
			<input type="hidden" name="next" value={$form.next} />
			<div class="grid gap-1.5">
				<Label for="email">Email</Label>
				<Input id="email" name="email" type="email" autocomplete="username" bind:value={$form.email} class="h-11" aria-invalid={$errors.email ? 'true' : undefined} />
				{#if $errors.email}<p class="text-sm text-destructive">{$errors.email}</p>{/if}
			</div>
			<div class="grid gap-1.5">
				<Label for="password">Kata sandi</Label>
				<Input id="password" name="password" type="password" autocomplete="current-password" bind:value={$form.password} class="h-11" aria-invalid={$errors.password ? 'true' : undefined} />
				{#if $errors.password}<p class="text-sm text-destructive">{$errors.password}</p>{/if}
			</div>
			{#if $message}<p class="rounded-md bg-destructive/5 p-3 text-sm text-destructive" role="alert">{$message}</p>{/if}
			<Button type="submit" size="lg" class="h-11 w-full font-semibold" disabled={$submitting}>{$submitting ? 'Memeriksa…' : 'Masuk'}</Button>
		</form>
		<p class="mt-4 text-center text-xs text-muted-foreground"><a href="/shop" class="hover:underline">← Kembali ke toko</a></p>
	</div>
</main>

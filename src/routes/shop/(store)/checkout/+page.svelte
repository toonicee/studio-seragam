<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Alert from '$lib/components/ui/alert';
	import Lock from '@lucide/svelte/icons/lock';
	import QrCode from '@lucide/svelte/icons/qr-code';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import { fmtDayShort, rupiah } from '$lib/shop/format';
	import { cn } from '$lib/utils';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, submitting, message } = superForm(data.form, {
		resetForm: false,
		scrollToError: 'smooth'
	});

	const zone = $derived(data.zones.find((z) => z.id === $form.zoneId));
	const cart = $derived(data.cart);
</script>

<svelte:head><title>Checkout — Toko Indah Expres</title></svelte:head>

<div class="mx-auto max-w-6xl px-4 pt-8">
	<h1 class="display text-[40px] md:text-[52px]">Checkout</h1>
	<p class="mt-1 text-muted-foreground">Khusus mitra Indah Expres. Pembayaran lewat QRIS setelah pesanan dibuat.</p>

	{#if $message}
		<Alert.Root variant="destructive" class="mt-6">
			<CircleAlert />
			<Alert.Title>Pesanan belum bisa dibuat</Alert.Title>
			<Alert.Description>{$message}</Alert.Description>
		</Alert.Root>
	{/if}

	<form method="POST" use:enhance class="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]" novalidate>
		<div class="space-y-8">
			<fieldset class="rounded-lg border p-5 md:p-6">
				<legend class="float-left mb-3 w-full font-display text-xl font-bold uppercase">1. Data mitra</legend>
				<p class="clear-both text-sm text-muted-foreground">Kode mitra dan nomor WhatsApp harus sama dengan yang terdaftar di admin.</p>
				<div class="mt-4 grid gap-4 sm:grid-cols-2">
					<div class="grid gap-1.5">
						<Label for="partnerCode">Kode mitra</Label>
						<Input id="partnerCode" name="partnerCode" bind:value={$form.partnerCode} autocomplete="off" autocapitalize="characters" placeholder="mis. MITRA-001" aria-invalid={$errors.partnerCode ? 'true' : undefined} class="h-11 uppercase" />
						{#if $errors.partnerCode}<p class="text-sm text-destructive">{$errors.partnerCode}</p>{/if}
					</div>
					<div class="grid gap-1.5">
						<Label for="phone">Nomor WhatsApp</Label>
						<Input id="phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" bind:value={$form.phone} placeholder="0812 3456 7890" aria-invalid={$errors.phone ? 'true' : undefined} class="h-11" />
						{#if $errors.phone}<p class="text-sm text-destructive">{$errors.phone}</p>{/if}
					</div>
				</div>
			</fieldset>

			<fieldset class="rounded-lg border p-5 md:p-6">
				<legend class="float-left mb-3 w-full font-display text-xl font-bold uppercase">2. Penerima & alamat</legend>
				<div class="clear-both grid gap-4 sm:grid-cols-2">
					<div class="grid gap-1.5">
						<Label for="name">Nama penerima</Label>
						<Input id="name" name="name" autocomplete="name" bind:value={$form.name} aria-invalid={$errors.name ? 'true' : undefined} class="h-11" />
						{#if $errors.name}<p class="text-sm text-destructive">{$errors.name}</p>{/if}
					</div>
					<div class="grid gap-1.5">
						<Label for="email">Email <span class="font-normal text-muted-foreground">(opsional)</span></Label>
						<Input id="email" name="email" type="email" autocomplete="email" bind:value={$form.email} aria-invalid={$errors.email ? 'true' : undefined} class="h-11" />
						{#if $errors.email}<p class="text-sm text-destructive">{$errors.email}</p>{/if}
					</div>
					<div class="grid gap-1.5 sm:col-span-2">
						<Label for="address">Alamat lengkap</Label>
						<Textarea id="address" name="address" autocomplete="street-address" rows={3} bind:value={$form.address} placeholder="Jalan, nomor, RT/RW, kelurahan, kecamatan" aria-invalid={$errors.address ? 'true' : undefined} />
						{#if $errors.address}<p class="text-sm text-destructive">{$errors.address}</p>{/if}
					</div>
					<div class="grid gap-1.5">
						<Label for="city">Kota / kabupaten</Label>
						<Input id="city" name="city" autocomplete="address-level2" bind:value={$form.city} aria-invalid={$errors.city ? 'true' : undefined} class="h-11" />
						{#if $errors.city}<p class="text-sm text-destructive">{$errors.city}</p>{/if}
					</div>
					<div class="grid gap-1.5">
						<Label for="postalCode">Kode pos <span class="font-normal text-muted-foreground">(opsional)</span></Label>
						<Input id="postalCode" name="postalCode" inputmode="numeric" autocomplete="postal-code" bind:value={$form.postalCode} aria-invalid={$errors.postalCode ? 'true' : undefined} class="h-11" />
						{#if $errors.postalCode}<p class="text-sm text-destructive">{$errors.postalCode}</p>{/if}
					</div>
				</div>
			</fieldset>

			<fieldset class="rounded-lg border p-5 md:p-6">
				<legend class="float-left mb-3 w-full font-display text-xl font-bold uppercase">3. Pengiriman</legend>
				<div class="clear-both grid gap-2">
					{#each data.zones as z (z.id)}
						<label class={cn('flex cursor-pointer items-center justify-between gap-3 rounded-md border p-4 transition-colors', $form.zoneId === z.id ? 'border-brand bg-brand-soft/50' : 'hover:border-ink/30')}>
							<span class="flex items-center gap-3">
								<input type="radio" name="zoneId" value={z.id} bind:group={$form.zoneId} class="size-4 accent-[var(--brand)]" />
								<span class="font-medium">{z.name}</span>
							</span>
							<span class="font-semibold">{rupiah(z.fee)}</span>
						</label>
					{/each}
					{#if $errors.zoneId}<p class="text-sm text-destructive">{$errors.zoneId}</p>{/if}
				</div>
				<div class="mt-4 grid gap-1.5">
					<Label for="note">Catatan <span class="font-normal text-muted-foreground">(opsional)</span></Label>
					<Textarea id="note" name="note" rows={2} bind:value={$form.note} placeholder="mis. titip ke satpam kantor" />
				</div>
			</fieldset>
		</div>

		<aside class="h-fit rounded-lg border bg-muted/30 p-5 lg:sticky lg:top-36">
			<h2 class="font-display text-2xl font-bold uppercase">Pesanan Anda</h2>
			<ul class="mt-4 divide-y">
				{#each cart.lines as line (line.key)}
					<li class="flex gap-3 py-3">
						{#if line.image}
							<img src={line.image.src} alt="" width="52" height="65" class="h-[65px] w-[52px] shrink-0 rounded bg-surface object-cover" style:object-position={line.image.src.endsWith('.jpg') ? 'center 15%' : 'center'} />
						{/if}
						<div class="min-w-0 flex-1 text-sm">
							<p class="font-medium">{line.name}</p>
							<p class="text-muted-foreground">{line.size ?? 'Satu ukuran'} · {line.qty} pcs</p>
							{#if line.batch}<p class="text-xs text-muted-foreground">PO ditutup {fmtDayShort(line.batch.closesAt)}</p>{/if}
						</div>
						<p class="text-sm font-semibold tabular-nums">{rupiah(line.lineTotal)}</p>
					</li>
				{/each}
			</ul>
			<dl class="mt-2 space-y-2 border-t pt-4 text-sm">
				<div class="flex justify-between"><dt class="text-muted-foreground">Subtotal</dt><dd class="font-medium tabular-nums">{rupiah(cart.subtotal)}</dd></div>
				<div class="flex justify-between"><dt class="text-muted-foreground">Ongkir</dt><dd class="font-medium tabular-nums">{rupiah(zone?.fee ?? 0)}</dd></div>
				<div class="flex justify-between"><dt class="text-muted-foreground">Kode unik</dt><dd class="text-muted-foreground">+Rp1–999</dd></div>
				<div class="flex items-baseline justify-between border-t pt-3"><dt class="font-semibold">Total</dt><dd class="font-display text-2xl font-bold">{rupiah(cart.subtotal + (zone?.fee ?? 0))}<span class="text-sm">+</span></dd></div>
			</dl>
			<p class="mt-3 flex gap-2 rounded-md bg-white p-3 text-xs leading-relaxed text-muted-foreground">
				<QrCode class="size-4 shrink-0 text-brand" />
				Setelah pesanan dibuat, Anda melihat QRIS dan nominal persis yang harus dibayar. Batas bayar {data.payWindowHours} jam.
			</p>
			<Button type="submit" size="lg" class="mt-4 h-12 w-full text-base font-semibold" disabled={$submitting || !cart.ready}>
				<Lock class="size-4" />
				{$submitting ? 'Membuat pesanan…' : 'Buat pesanan'}
			</Button>
			{#if !cart.ready}<p class="mt-2 text-xs font-medium text-destructive">Ada barang yang PO-nya sudah ditutup. <a href="/shop/keranjang" class="underline">Perbarui keranjang</a>.</p>{/if}
		</aside>
	</form>
</div>

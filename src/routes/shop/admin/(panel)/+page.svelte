<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import * as Alert from '$lib/components/ui/alert';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import PoBadge from '$lib/components/shop/PoBadge.svelte';
	import PoProgress from '$lib/components/shop/PoProgress.svelte';
	import BadgeCheck from '@lucide/svelte/icons/badge-check';
	import Truck from '@lucide/svelte/icons/truck';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import Hourglass from '@lucide/svelte/icons/hourglass';
	import Play from '@lucide/svelte/icons/play';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import QrCode from '@lucide/svelte/icons/qr-code';
	import { fmtDateTime, fmtDeadline, rupiah } from '$lib/shop/format';
	import { poPhase } from '$lib/shop/po';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const s = $derived(data.stats);
	const cards = $derived([
		{ href: '/shop/admin/pembayaran', label: 'Menunggu konfirmasi', value: s.pendingConfirmation, icon: BadgeCheck, hint: 'Cocokkan di GoPay Merchant', strong: s.pendingConfirmation > 0 },
		{ href: '/shop/admin/pesanan?status=siap-kirim', label: 'Siap kirim', value: s.readyToShip, icon: Truck, hint: 'PO selesai, isi resi', strong: s.readyToShip > 0 },
		{ href: '/shop/admin/refund', label: 'Perlu refund', value: s.refundsPending, icon: RotateCcw, hint: rupiah(s.refundsPendingAmount), strong: s.refundsPending > 0 },
		{ href: '/shop/admin/pesanan?status=pending_payment', label: 'Menunggu bayar', value: s.pendingPayment, icon: Hourglass, hint: 'Batal otomatis lewat batas', strong: false }
	]);
	const open = $derived(s.batches.filter((b) => b.status === 'open'));
	const closed = $derived(s.batches.filter((b) => b.status !== 'open').slice(0, 6));
</script>

<svelte:head><title>Dashboard — Admin Toko Indah Expres</title></svelte:head>

<PageHeader title="Dashboard" description="Ringkasan PO dan pekerjaan admin hari ini.">
	{#snippet actions()}
		<form
			method="POST"
			action="?/runJob"
			use:enhance={() =>
				async ({ result, update }) => {
					await update();
					if (result.type === 'success') {
						const r = result.data?.job as { expiredOrders: number; closed: unknown[]; refundsCreated: number } | null;
						toast.success(r ? `Selesai: ${r.closed.length} PO ditutup, ${r.expiredOrders} pesanan kedaluwarsa, ${r.refundsCreated} refund baru` : 'Proses selesai');
					}
				}}
		>
			<Button type="submit" variant="outline"><Play class="size-4" /> Jalankan proses otomatis</Button>
		</form>
	{/snippet}
</PageHeader>

{#if !data.qrisReady}
	<Alert.Root class="mb-4 border-warning/30 bg-warning-soft">
		<QrCode class="text-warning" />
		<Alert.Title>QRIS belum diunggah</Alert.Title>
		<Alert.Description>Pembeli belum bisa membayar. <a href="/shop/admin/pengaturan" class="font-semibold underline">Unggah gambar QRIS statis GoPay Merchant</a>.</Alert.Description>
	</Alert.Root>
{/if}
{#if s.urgent > 0}
	<Alert.Root class="mb-4 border-destructive/30 bg-destructive/5">
		<TriangleAlert class="text-destructive" />
		<Alert.Title>{s.urgent} pembayaran perlu dikonfirmasi sebelum PO tutup malam ini (23:59 WIB)</Alert.Title>
		<Alert.Description>Pembayaran yang belum dikonfirmasi saat PO ditutup akan dibatalkan otomatis. <a href="/shop/admin/pembayaran" class="font-semibold underline">Konfirmasi sekarang</a>.</Alert.Description>
	</Alert.Root>
{/if}

<div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
	{#each cards as c (c.label)}
		<a href={c.href} class="rounded-lg border bg-white p-4 transition hover:border-brand/40 hover:shadow-sm">
			<div class="flex items-center justify-between text-muted-foreground">
				<span class="text-xs font-semibold tracking-wide uppercase">{c.label}</span>
				<c.icon class="size-4" />
			</div>
			<p class={c.strong ? 'mt-2 font-display text-4xl font-bold text-brand' : 'mt-2 font-display text-4xl font-bold'}>{c.value}</p>
			<p class="text-xs text-muted-foreground">{c.hint}</p>
		</a>
	{/each}
</div>

<section class="mt-8">
	<div class="mb-3 flex items-end justify-between">
		<h2 class="font-display text-2xl font-bold uppercase">PO dibuka ({open.length})</h2>
		<a href="/shop/admin/produk" class="text-sm font-semibold text-brand hover:underline">Kelola produk →</a>
	</div>
	<ul class="grid gap-3 md:grid-cols-2">
		{#each open as b (b.id)}
			<li>
				<a href="/shop/admin/po/{b.id}" class="block rounded-lg border bg-white p-4 hover:border-brand/40">
					<div class="flex items-start justify-between gap-2">
						<div>
							<p class="font-semibold">{b.productName}</p>
							<p class="text-xs text-muted-foreground">Batch {b.batchNo} · tutup {fmtDeadline(b.closesAt)}</p>
						</div>
						<PoBadge phase={poPhase(b, data.now)} />
					</div>
					<PoProgress batch={b} now={data.now} class="mt-3" />
				</a>
			</li>
		{:else}
			<li class="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">Belum ada PO yang dibuka.</li>
		{/each}
	</ul>
</section>

{#if closed.length}
	<section class="mt-8">
		<h2 class="mb-3 font-display text-2xl font-bold uppercase">PO ditutup</h2>
		<ul class="divide-y rounded-lg border bg-white">
			{#each closed as b (b.id)}
				<li>
					<a href="/shop/admin/po/{b.id}" class="flex items-center justify-between gap-3 p-4 hover:bg-muted/40">
						<div>
							<p class="font-medium">{b.productName} <span class="text-muted-foreground">· batch {b.batchNo}</span></p>
							<p class="text-xs text-muted-foreground">{b.collected}/{b.target} pcs · ditutup {b.closedAt ? fmtDateTime(b.closedAt) : '-'}</p>
						</div>
						<PoBadge phase={poPhase(b, data.now)} />
					</a>
				</li>
			{/each}
		</ul>
	</section>
{/if}

<p class="mt-8 text-xs text-muted-foreground">
	Proses otomatis berjalan tiap jam (menit ke-5). Terakhir: {data.lastJobRun ? fmtDateTime(data.lastJobRun) : 'belum pernah'}.
</p>

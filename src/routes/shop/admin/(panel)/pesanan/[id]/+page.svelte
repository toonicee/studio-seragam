<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import StatusBadge from '$lib/components/admin/StatusBadge.svelte';
	import PoBadge from '$lib/components/shop/PoBadge.svelte';
	import WaButton from '$lib/components/shop/WaButton.svelte';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import { fmtDateTime, fmtDeadline, fmtPhone, rupiah } from '$lib/shop/format';
	import { poPhase } from '$lib/shop/po';
	import { REFUND_REASON_LABEL } from '$lib/shop/status';
	import { waText } from '$lib/shop/wa';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const o = $derived(data.order);
	let showCancel = $state(false);
	let showReject = $state(false);

	const feedback: SubmitFunction = () => async ({ result, update }) => {
		if (result.type === 'success') toast.success(String(result.data?.ok ?? 'Tersimpan'));
		else if (result.type === 'failure') toast.error(String(result.data?.message ?? 'Gagal'));
		showCancel = false;
		showReject = false;
		await update({ reset: false });
	};
</script>

<svelte:head><title>{o.code} — Admin Toko Indah Expres</title></svelte:head>

<a href="/shop/admin/pesanan" class="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft class="size-4" /> Pesanan</a>
<div class="mb-6 flex flex-wrap items-end justify-between gap-3">
	<div>
		<h1 class="font-display text-4xl font-bold">{o.code}</h1>
		<div class="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
			<StatusBadge order={o.status} /> Dibuat {fmtDateTime(o.createdAt)}
		</div>
	</div>
	<a href="/shop/pesanan/{o.token}" target="_blank" class="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline">Halaman pembeli <ExternalLink class="size-3.5" /></a>
</div>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
	<div class="space-y-6">
		<section class="rounded-lg border bg-white">
			<h2 class="border-b px-5 py-3 font-semibold">Isi pesanan</h2>
			<ul class="divide-y">
				{#each o.items as item (item.id)}
					<li class="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
						<div>
							<p class="font-medium">{item.productName} <span class="text-muted-foreground">· {item.size ?? 'satu ukuran'} · {item.qty} pcs</span></p>
							<p class="text-xs text-muted-foreground">
								<a href="/shop/admin/po/{item.batch.id}" class="hover:underline">PO batch {item.batch.batchNo}</a> · {item.batch.collected}/{item.batch.target} pcs · tutup {fmtDeadline(item.batch.closesAt)}
							</p>
						</div>
						<div class="flex items-center gap-3">
							{#if item.refunded}<span class="text-xs font-bold text-muted-foreground uppercase">Direfund</span>{:else}<PoBadge phase={poPhase(item.batch, data.now)} />{/if}
							<span class="font-semibold tabular-nums">{rupiah(item.unitPrice * item.qty)}</span>
						</div>
					</li>
				{/each}
			</ul>
			<dl class="grid gap-1 border-t px-5 py-3 text-sm">
				<div class="flex justify-between"><dt class="text-muted-foreground">Subtotal</dt><dd class="tabular-nums">{rupiah(o.subtotal)}</dd></div>
				<div class="flex justify-between"><dt class="text-muted-foreground">Ongkir ({o.shippingZone})</dt><dd class="tabular-nums">{rupiah(o.shippingFee)}</dd></div>
				<div class="flex justify-between"><dt class="text-muted-foreground">Kode unik</dt><dd class="tabular-nums">{rupiah(o.uniqueCode)}</dd></div>
				<div class="flex justify-between text-base font-semibold"><dt>Total di GoPay</dt><dd class="tabular-nums">{rupiah(o.total)}</dd></div>
			</dl>
		</section>

		{#if o.refunds.length}
			<section class="rounded-lg border bg-white">
				<h2 class="border-b px-5 py-3 font-semibold">Refund</h2>
				<ul class="divide-y">
					{#each o.refunds as r (r.id)}
						<li class="space-y-3 px-5 py-4 text-sm">
							<div class="flex flex-wrap items-center justify-between gap-2">
								<div>
									<p class="font-semibold">{rupiah(r.amount)} · <span class="font-normal text-muted-foreground">{REFUND_REASON_LABEL[r.reason]}</span></p>
									<p class="text-xs text-muted-foreground">Dibuat {fmtDateTime(r.createdAt)}{r.doneAt ? ` · selesai ${fmtDateTime(r.doneAt)}` : ''}</p>
								</div>
								<StatusBadge refund={r.status} />
							</div>
							{#if r.status === 'pending'}
								<WaButton size="sm" phone={o.phone} text={waText.refund(o, r.amount, REFUND_REASON_LABEL[r.reason].toLowerCase())} label="Tanya tujuan refund" />
								<form method="POST" action="?/refund" use:enhance={feedback} class="grid gap-2 rounded-md bg-muted/40 p-3 sm:grid-cols-2">
									<input type="hidden" name="refundId" value={r.id} />
									<Input name="destination" value={r.destination} placeholder="Tujuan, mis. GoPay 0812… / BCA 123… a.n. …" class="sm:col-span-2" />
									<Input name="note" value={r.note} placeholder="Catatan (opsional)" class="sm:col-span-2" />
									<Button type="submit" name="status" value="done" size="sm" class="bg-success hover:bg-success/90">Sudah direfund</Button>
									{#if r.reason === 'unconfirmed'}
										<Button type="submit" name="status" value="void" size="sm" variant="outline">Dana tidak masuk</Button>
									{/if}
								</form>
							{:else}
								{#if r.destination}<p class="text-muted-foreground">Tujuan: {r.destination}</p>{/if}
								{#if r.status === 'done'}<WaButton size="sm" phone={o.phone} text={waText.refundDone(o, r.amount)} label="Kabari refund selesai" />{/if}
							{/if}
						</li>
					{/each}
				</ul>
			</section>
		{/if}
	</div>

	<aside class="space-y-6">
		<section class="rounded-lg border bg-white p-5 text-sm">
			<h2 class="font-semibold">Pembeli</h2>
			<p class="mt-2 font-medium">{o.customerName}</p>
			<p class="text-muted-foreground">{fmtPhone(o.phone)} · mitra {o.partnerCode}</p>
			{#if o.email}<p class="text-muted-foreground">{o.email}</p>{/if}
			<p class="mt-2">{o.address}, {o.city} {o.postalCode}</p>
			{#if o.note}<p class="mt-2 rounded bg-muted/50 p-2 text-muted-foreground">Catatan: {o.note}</p>{/if}
			<WaButton size="sm" phone={o.phone} text={`Halo ${o.customerName}, terkait pesanan ${o.code}: `} label="Chat pembeli" class="mt-3" />
		</section>

		<section class="space-y-3 rounded-lg border bg-white p-5 text-sm">
			<h2 class="font-semibold">Tindakan</h2>
			{#if o.status === 'pending_payment' || o.status === 'pending_confirmation'}
				{#if o.hasProof}
					<a href="/shop/admin/bukti/{o.id}" target="_blank"><img src="/shop/admin/bukti/{o.id}" alt="Bukti bayar" class="max-h-64 w-full rounded-md border object-contain" /></a>
				{:else}
					<p class="text-muted-foreground">Belum ada bukti bayar. Batas bayar {fmtDateTime(o.payBy)}.</p>
					<WaButton size="sm" phone={o.phone} text={waText.reminder(o, data.statusUrl)} label="Ingatkan bayar" />
				{/if}
				<form method="POST" action="?/confirm" use:enhance={feedback}>
					<Button type="submit" class="w-full bg-success hover:bg-success/90">Konfirmasi lunas ({rupiah(o.total)})</Button>
				</form>
				{#if o.status === 'pending_confirmation'}
					<Button variant="outline" class="w-full" onclick={() => (showReject = !showReject)}>Tolak bukti</Button>
					{#if showReject}
						<form method="POST" action="?/reject" use:enhance={feedback} class="grid gap-2">
							<Input name="reason" required placeholder="Alasan penolakan" />
							<Button type="submit" variant="destructive" size="sm">Tolak</Button>
						</form>
					{/if}
				{/if}
			{:else if o.status === 'paid'}
				{#if data.readyToShip}
					<form method="POST" action="?/ship" use:enhance={feedback} class="grid gap-2">
						<label for="trackingNo" class="font-medium">Nomor resi Indah Expres</label>
						<Input id="trackingNo" name="trackingNo" required class="font-mono uppercase" />
						<Button type="submit">Tandai dikirim</Button>
					</form>
				{:else}
					<p class="text-muted-foreground">Lunas. Menunggu semua PO di pesanan ini selesai sebelum dikirim.</p>
				{/if}
			{:else if o.status === 'shipped'}
				<p>Dikirim {o.shippedAt ? fmtDateTime(o.shippedAt) : ''} · resi <b class="font-mono">{o.trackingNo}</b></p>
				<WaButton size="sm" phone={o.phone} text={waText.shipped(o, o.trackingNo ?? '', data.statusUrl)} label="Kirim resi ke pembeli" />
			{:else if o.status === 'cancelled'}
				<p class="text-muted-foreground">Dibatalkan {o.cancelledAt ? fmtDateTime(o.cancelledAt) : ''}: {o.cancelReason}</p>
			{/if}

			{#if o.status !== 'cancelled' && o.status !== 'shipped'}
				<div class="border-t pt-3">
					<button type="button" class="text-sm text-destructive hover:underline" onclick={() => (showCancel = !showCancel)}>Batalkan pesanan…</button>
					{#if showCancel}
						<form method="POST" action="?/cancel" use:enhance={feedback} class="mt-2 grid gap-2">
							<Input name="reason" required placeholder="Alasan, mis. permintaan pembeli lewat WhatsApp" />
							<p class="text-xs text-muted-foreground">{o.status === 'paid' ? 'Pesanan lunas otomatis masuk daftar refund.' : 'Pesanan belum lunas, tidak ada refund.'}</p>
							<Button type="submit" variant="destructive" size="sm">Batalkan pesanan</Button>
						</form>
					{/if}
				</div>
			{/if}
		</section>
	</aside>
</div>

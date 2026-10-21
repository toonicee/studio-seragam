<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import StatusBadge from '$lib/components/admin/StatusBadge.svelte';
	import PoBadge from '$lib/components/shop/PoBadge.svelte';
	import PoProgress from '$lib/components/shop/PoProgress.svelte';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Download from '@lucide/svelte/icons/download';
	import { fmtDateTime, fmtDay, fmtDeadline, fmtPhone } from '$lib/shop/format';
	import { poPhase, shipEstimate } from '$lib/shop/po';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const b = $derived(data.batch);
	const total = $derived(data.recap.reduce((s, r) => s + r.qty, 0));
</script>

<svelte:head><title>PO {b.productName} batch {b.batchNo} — Admin</title></svelte:head>

<a href="/shop/admin/produk/{b.productId}" class="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft class="size-4" /> {b.productName}</a>
<PageHeader title="{b.productName} · batch {b.batchNo}" description="Tutup {fmtDeadline(b.closesAt)} · estimasi kirim {fmtDay(shipEstimate(b.closesAt, b.productionDays))}">
	{#snippet actions()}
		<Button href="/shop/admin/po/{b.id}/rekap.csv" variant="outline" data-sveltekit-reload><Download class="size-4" /> Ekspor CSV</Button>
		{#if b.status === 'production'}
			<form method="POST" action="?/done" use:enhance={() => async ({ result, update }) => {
				if (result.type === 'success') toast.success('PO ditandai selesai');
				else if (result.type === 'failure') toast.error(String(result.data?.message ?? 'Gagal'));
				await update();
			}}>
				<Button type="submit">Tandai selesai</Button>
			</form>
		{/if}
	{/snippet}
</PageHeader>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
	<div class="space-y-6">
		<section class="rounded-lg border bg-white p-5">
			<div class="flex items-center justify-between"><PoBadge phase={poPhase(b, data.now)} /><span class="text-xs text-muted-foreground">target {b.target} pcs</span></div>
			<div class="mt-3"><PoProgress batch={b} now={data.now} size="lg" /></div>
			{#if b.closedAt}<p class="mt-3 text-xs text-muted-foreground">Ditutup {fmtDateTime(b.closedAt)}</p>{/if}
			{#if data.pending.pending_confirmation || data.pending.pending_payment}
				<p class="mt-3 rounded-md bg-warning-soft p-2.5 text-xs text-warning">
					Belum dihitung: {data.pending.pending_confirmation ?? 0} pcs menunggu konfirmasi, {data.pending.pending_payment ?? 0} pcs menunggu bayar.
				</p>
			{/if}
		</section>

		<section class="rounded-lg border bg-white">
			<h2 class="border-b px-5 py-3 font-semibold">Rekap per ukuran (lunas)</h2>
			<Table.Root>
				<Table.Body>
					{#each data.recap as r (r.size)}
						<Table.Row><Table.Cell class="pl-5 font-semibold">{r.size}</Table.Cell><Table.Cell class="pr-5 text-right tabular-nums">{r.qty} pcs</Table.Cell></Table.Row>
					{:else}
						<Table.Row><Table.Cell class="py-6 text-center text-muted-foreground">Belum ada pesanan lunas</Table.Cell></Table.Row>
					{/each}
				</Table.Body>
				{#if data.recap.length}
					<Table.Footer><Table.Row><Table.Cell class="pl-5">Total</Table.Cell><Table.Cell class="pr-5 text-right tabular-nums">{total} pcs</Table.Cell></Table.Row></Table.Footer>
				{/if}
			</Table.Root>
		</section>
	</div>

	<section class="rounded-lg border bg-white">
		<h2 class="border-b px-5 py-3 font-semibold">Pesanan lunas ({data.lines.length} baris)</h2>
		<div class="overflow-x-auto">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head class="pl-5">Pesanan</Table.Head>
						<Table.Head>Pembeli</Table.Head>
						<Table.Head>Ukuran</Table.Head>
						<Table.Head class="text-right">Jumlah</Table.Head>
						<Table.Head class="pr-5">Status</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.lines as l, i (i)}
						<Table.Row>
							<Table.Cell class="pl-5"><a href="/shop/admin/pesanan/{l.orderId}" class="font-medium text-brand hover:underline">{l.code}</a></Table.Cell>
							<Table.Cell><span class="font-medium">{l.customerName}</span><span class="block text-xs text-muted-foreground">{fmtPhone(l.phone)} · {l.city}</span></Table.Cell>
							<Table.Cell>{l.size ?? '—'}</Table.Cell>
							<Table.Cell class="text-right tabular-nums">{l.qty}</Table.Cell>
							<Table.Cell class="pr-5"><StatusBadge order={l.status} /></Table.Cell>
						</Table.Row>
					{:else}
						<Table.Row><Table.Cell colspan={5} class="py-8 text-center text-muted-foreground">Belum ada pesanan lunas</Table.Cell></Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	</section>
</div>

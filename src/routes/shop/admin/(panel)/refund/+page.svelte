<script lang="ts">
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import StatusBadge from '$lib/components/admin/StatusBadge.svelte';
	import WaButton from '$lib/components/shop/WaButton.svelte';
	import type { Column } from '$lib/components/admin/table';
	import { fmtDateTime, fmtPhone, rupiah } from '$lib/shop/format';
	import { REFUND_REASON_LABEL } from '$lib/shop/status';
	import { waText } from '$lib/shop/wa';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	type Row = (typeof data.rows)[number];
	const columns: Column<Row>[] = [
		{ key: 'order', label: 'Pesanan', sort: (r) => r.code },
		{ key: 'buyer', label: 'Pembeli', sort: (r) => r.customerName },
		{ key: 'amount', label: 'Nominal', sort: (r) => r.amount, class: 'text-right' },
		{ key: 'status', label: 'Status', sort: (r) => r.status },
		{ key: 'action', label: '' }
	];
	const pendingTotal = $derived(data.rows.filter((r) => r.status === 'pending').reduce((s, r) => s + r.amount, 0));
</script>

<svelte:head><title>Refund — Admin Toko Indah Expres</title></svelte:head>

<PageHeader
	title="Refund"
	description="QRIS statis tidak bisa refund otomatis: tanyakan tujuan refund lewat WhatsApp, transfer, lalu tandai di halaman pesanan. Menunggu: {rupiah(pendingTotal)}."
/>

<DataTable rows={data.rows} {columns} search={(r) => `${r.code} ${r.customerName} ${r.phone} ${r.amount} ${r.destination}`} searchPlaceholder="Cari kode, nama, nominal…" empty="Belum ada refund">
	{#snippet cell(r, c)}
		{#if c.key === 'order'}
			<a href="/shop/admin/pesanan/{r.orderId}" class="font-semibold text-brand hover:underline">{r.code}</a>
			<p class="text-xs text-muted-foreground">{REFUND_REASON_LABEL[r.reason]}</p>
		{:else if c.key === 'buyer'}
			<p class="font-medium">{r.customerName}</p>
			<p class="text-xs text-muted-foreground">{fmtPhone(r.phone)}{r.destination ? ` · ke ${r.destination}` : ''}</p>
		{:else if c.key === 'amount'}
			<span class="font-semibold tabular-nums">{rupiah(r.amount)}</span>
		{:else if c.key === 'status'}
			<StatusBadge refund={r.status} />
			<p class="mt-1 text-xs text-muted-foreground">{r.doneAt ? fmtDateTime(r.doneAt) : fmtDateTime(r.createdAt)}</p>
		{:else if c.key === 'action'}
			{#if r.status === 'pending'}
				<div class="flex flex-wrap justify-end gap-2">
					<WaButton size="sm" phone={r.phone} text={waText.refund({ code: r.code, customerName: r.customerName, total: r.total }, r.amount, REFUND_REASON_LABEL[r.reason].toLowerCase())} label="Tanya tujuan" />
					<a href="/shop/admin/pesanan/{r.orderId}" class="inline-flex h-8 items-center rounded-md border px-3 text-xs font-semibold hover:bg-muted">Proses</a>
				</div>
			{/if}
		{/if}
	{/snippet}
</DataTable>

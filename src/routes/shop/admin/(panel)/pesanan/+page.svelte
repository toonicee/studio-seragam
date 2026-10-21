<script lang="ts">
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import StatusBadge from '$lib/components/admin/StatusBadge.svelte';
	import type { Column } from '$lib/components/admin/table';
	import type { AdminOrderRow } from '$lib/server/shop/admin';
	import { fmtDateTime, fmtPhone, rupiah } from '$lib/shop/format';
	import { cn } from '$lib/utils';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const columns: Column<AdminOrderRow>[] = [
		{ key: 'code', label: 'Pesanan', sort: (r) => r.id },
		{ key: 'buyer', label: 'Pembeli', sort: (r) => r.customerName },
		{ key: 'items', label: 'Isi', class: 'hidden md:table-cell' },
		{ key: 'total', label: 'Total', sort: (r) => r.total, class: 'text-right' },
		{ key: 'status', label: 'Status', sort: (r) => r.status }
	];
</script>

<svelte:head><title>Pesanan — Admin Toko Indah Expres</title></svelte:head>

<PageHeader title="Pesanan" description="Semua pesanan toko. Klik nomor pesanan untuk konfirmasi, kirim, batal, atau refund." />

<nav class="-mx-4 mb-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none]" aria-label="Filter status">
	{#each data.tabs as t (t.key)}
		<a
			href={t.key ? `?status=${t.key}` : '?'}
			class={cn(
				'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap',
				data.filter === t.key ? 'border-ink bg-ink text-white' : 'bg-white hover:border-ink/30'
			)}
		>
			{t.label} <span class={data.filter === t.key ? 'text-white/70' : 'text-muted-foreground'}>{t.n}</span>
		</a>
	{/each}
</nav>

<DataTable
	rows={data.rows}
	{columns}
	search={(r) => `${r.code} ${r.customerName} ${r.phone} ${r.partnerCode} ${r.city} ${r.summary} ${r.total}`}
	searchPlaceholder="Cari kode, nama, nomor, nominal…"
	empty="Tidak ada pesanan"
>
	{#snippet cell(r, c)}
		{#if c.key === 'code'}
			<a href="/shop/admin/pesanan/{r.id}" class="font-semibold text-brand hover:underline">{r.code}</a>
			<p class="text-xs text-muted-foreground">{fmtDateTime(r.createdAt)}</p>
		{:else if c.key === 'buyer'}
			<p class="font-medium">{r.customerName}</p>
			<p class="text-xs text-muted-foreground">{fmtPhone(r.phone)} · {r.partnerCode}</p>
		{:else if c.key === 'items'}
			<p class="max-w-xs text-sm text-muted-foreground">{r.summary}</p>
		{:else if c.key === 'total'}
			<span class="font-semibold tabular-nums">{rupiah(r.total)}</span>
		{:else if c.key === 'status'}
			<div class="flex flex-col items-start gap-1">
				<StatusBadge order={r.status} />
				{#if r.readyToShip}<span class="text-[11px] font-semibold text-success">● Siap kirim</span>{/if}
				{#if r.trackingNo}<span class="font-mono text-[11px] text-muted-foreground">{r.trackingNo}</span>{/if}
			</div>
		{/if}
	{/snippet}
</DataTable>

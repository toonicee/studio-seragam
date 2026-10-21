<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import * as Table from '$lib/components/ui/table';
	import ArrowDown from '@lucide/svelte/icons/arrow-down';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import Search from '@lucide/svelte/icons/search';
	import { cn } from '$lib/utils';
	import type { Column } from './table';

	let {
		rows,
		columns,
		cell,
		search,
		searchPlaceholder = 'Cari…',
		pageSize = 20,
		empty = 'Belum ada data',
		toolbar,
		rowClass
	}: {
		rows: T[];
		columns: Column<T>[];
		cell: Snippet<[T, Column<T>]>;
		search?: (row: T) => string;
		searchPlaceholder?: string;
		pageSize?: number;
		empty?: string;
		toolbar?: Snippet;
		rowClass?: (row: T) => string;
	} = $props();

	let q = $state('');
	let sortKey = $state<string | null>(null);
	let dir = $state<1 | -1>(1);
	let pageIdx = $state(0);

	const filtered = $derived.by(() => {
		const words = q.toLowerCase().split(/\s+/).filter(Boolean);
		if (!search || !words.length) return rows;
		return rows.filter((r) => {
			const hay = search(r).toLowerCase();
			return words.every((w) => hay.includes(w));
		});
	});
	const sorted = $derived.by(() => {
		const col = columns.find((c) => c.key === sortKey);
		if (!col?.sort) return filtered;
		const get = col.sort;
		return [...filtered].sort((a, b) => {
			const x = get(a);
			const y = get(b);
			return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'id')) * dir;
		});
	});
	const pages = $derived(Math.max(1, Math.ceil(sorted.length / pageSize)));
	const current = $derived(Math.min(pageIdx, pages - 1));
	const visible = $derived(sorted.slice(current * pageSize, (current + 1) * pageSize));

	function toggleSort(c: Column<T>) {
		if (!c.sort) return;
		if (sortKey === c.key) dir = dir === 1 ? -1 : 1;
		else {
			sortKey = c.key;
			dir = 1;
		}
	}
</script>

<div class="space-y-3">
	{#if search || toolbar}
		<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
			{#if search}
				<div class="relative w-full sm:max-w-xs">
					<Search class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<input
						type="search"
						bind:value={q}
						oninput={() => (pageIdx = 0)}
						placeholder={searchPlaceholder}
						aria-label={searchPlaceholder}
						class="h-10 w-full rounded-md border border-input bg-white pr-3 pl-9 text-sm outline-none focus:border-brand focus:ring-3 focus:ring-brand/15"
					/>
				</div>
			{/if}
			{@render toolbar?.()}
		</div>
	{/if}

	<div class="overflow-hidden rounded-lg border bg-white">
		<Table.Root>
			<Table.Header class="bg-muted/50">
				<Table.Row>
					{#each columns as c (c.key)}
						<Table.Head class={cn('h-10 text-xs font-semibold tracking-wide uppercase', c.class)}>
							{#if c.sort}
								<button type="button" class="inline-flex items-center gap-1 hover:text-foreground" onclick={() => toggleSort(c)}>
									{c.label}
									{#if sortKey === c.key}
										{#if dir === 1}<ArrowUp class="size-3.5" />{:else}<ArrowDown class="size-3.5" />{/if}
									{:else}
										<ChevronsUpDown class="size-3.5 opacity-40" />
									{/if}
								</button>
							{:else}
								{c.label}
							{/if}
						</Table.Head>
					{/each}
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each visible as row, i (i)}
					<Table.Row class={rowClass?.(row)}>
						{#each columns as c (c.key)}
							<Table.Cell class={cn('py-3 align-top', c.class)}>{@render cell(row, c)}</Table.Cell>
						{/each}
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="py-10 text-center text-muted-foreground">{empty}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	{#if pages > 1}
		<div class="flex items-center justify-between text-sm text-muted-foreground">
			<span>{sorted.length} baris · halaman {current + 1} dari {pages}</span>
			<div class="flex gap-2">
				<button type="button" class="h-9 rounded-md border bg-white px-3 disabled:opacity-40" disabled={current === 0} onclick={() => (pageIdx = current - 1)}>Sebelumnya</button>
				<button type="button" class="h-9 rounded-md border bg-white px-3 disabled:opacity-40" disabled={current >= pages - 1} onclick={() => (pageIdx = current + 1)}>Berikutnya</button>
			</div>
		</div>
	{/if}
</div>

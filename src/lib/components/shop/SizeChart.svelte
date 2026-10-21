<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Table from '$lib/components/ui/table';
	import Ruler from '@lucide/svelte/icons/ruler';
	import type { SizeRow } from '$lib/shop/types';

	let { rows, name }: { rows: SizeRow[]; name: string } = $props();
</script>

<Dialog.Root>
	<Dialog.Trigger class="inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4 hover:text-brand">
		<Ruler class="size-4" /> Tabel ukuran
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title class="font-display text-2xl font-bold tracking-wide uppercase">Tabel ukuran</Dialog.Title>
			<Dialog.Description>{name} · ukuran badan pakaian dalam cm</Dialog.Description>
		</Dialog.Header>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Ukuran</Table.Head>
					<Table.Head class="text-right">Panjang badan</Table.Head>
					<Table.Head class="text-right">Lebar dada</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each rows as r (r.size)}
					<Table.Row>
						<Table.Cell class="font-semibold">{r.size}</Table.Cell>
						<Table.Cell class="text-right tabular-nums">{r.length ?? '—'}</Table.Cell>
						<Table.Cell class="text-right tabular-nums">{r.width ?? '—'}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
		<p class="text-xs text-muted-foreground">
			Bandingkan dengan pakaian yang biasa Anda pakai: letakkan mendatar, ukur lebar dada dari ketiak ke ketiak.
			Ukuran tidak bisa ditukar setelah PO ditutup.
		</p>
	</Dialog.Content>
</Dialog.Root>

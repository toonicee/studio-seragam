<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Table from '$lib/components/ui/table';
	import Ruler from '@lucide/svelte/icons/ruler';
	import { t } from '$lib/shop/i18n.svelte';
	import type { SizeRow } from '$lib/shop/types';

	let { rows, name }: { rows: SizeRow[]; name: string } = $props();
</script>

<Dialog.Root>
	<Dialog.Trigger class="inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4 hover:text-brand">
		<Ruler class="size-4" /> {t('size.trigger')}
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title class="font-display text-2xl font-bold tracking-wide uppercase">{t('size.trigger')}</Dialog.Title>
			<Dialog.Description>{t('size.desc', { name })}</Dialog.Description>
		</Dialog.Header>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>{t('size.colSize')}</Table.Head>
					<Table.Head class="text-right">{t('size.colLength')}</Table.Head>
					<Table.Head class="text-right">{t('size.colWidth')}</Table.Head>
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
			{t('size.note')}
		</p>
	</Dialog.Content>
</Dialog.Root>

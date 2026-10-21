<script lang="ts">
	import type { Snippet } from 'svelte';
	import { t } from '$lib/shop/i18n.svelte';

	let {
		title,
		subtitle = '',
		href = '',
		linkLabel,
		children
	}: { title: string; subtitle?: string; href?: string; linkLabel?: string; children?: Snippet } = $props();
</script>

<div class="mb-5 flex items-end justify-between gap-4">
	<div>
		<h2 class="display text-[30px] md:text-[38px]">{title}</h2>
		{#if subtitle}<p class="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>{/if}
	</div>
	{#if href}
		<a href={href} class="shrink-0 text-sm font-semibold text-brand underline-offset-4 hover:underline">{linkLabel ?? t('common.seeAll')} →</a>
	{/if}
	{@render children?.()}
</div>

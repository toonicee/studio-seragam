<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, description = '', actions }: { title: string; description?: string; actions?: Snippet } = $props();
</script>

<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
	<div>
		<h1 class="font-display text-3xl font-bold tracking-wide uppercase md:text-4xl">{title}</h1>
		{#if description}<p class="mt-1 text-sm text-muted-foreground">{description}</p>{/if}
	</div>
	{#if actions}<div class="flex flex-wrap gap-2">{@render actions()}</div>{/if}
</div>

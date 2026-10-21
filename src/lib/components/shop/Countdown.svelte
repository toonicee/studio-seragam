<script lang="ts">
	import { onMount } from 'svelte';

	let { until, now }: { until: number; now: number } = $props();
	let current = $state(0);
	onMount(() => {
		current = Date.now();
		const t = setInterval(() => (current = Date.now()), 30_000);
		return () => clearInterval(t);
	});
	const left = $derived(Math.max(0, until - (current || now)));
	const h = $derived(Math.floor(left / 3600_000));
	const m = $derived(Math.floor((left % 3600_000) / 60_000));
</script>

{#if left > 0}
	<span class="tabular-nums">{h > 0 ? `${h} jam ` : ''}{m} menit lagi</span>
{:else}
	<span>sudah lewat</span>
{/if}

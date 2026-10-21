<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/shop/i18n.svelte';

	let { until, now }: { until: number; now: number } = $props();
	let current = $state(0);
	onMount(() => {
		current = Date.now();
		const timer = setInterval(() => (current = Date.now()), 30_000);
		return () => clearInterval(timer);
	});
	const left = $derived(Math.max(0, until - (current || now)));
	const h = $derived(Math.floor(left / 3600_000));
	const m = $derived(Math.floor((left % 3600_000) / 60_000));
</script>

{#if left > 0}
	<span class="tabular-nums">{h > 0 ? t('time.hm', { h, m }) : t('time.m', { m })}</span>
{:else}
	<span>{t('time.passed')}</span>
{/if}

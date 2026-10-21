<script lang="ts">
	import '../../shop.css';
	import type { LayoutProps } from './$types';
	import { Toaster } from '$lib/components/ui/sonner';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<meta name="theme-color" content="#ffffff" />
</svelte:head>

{@render children()}
<Toaster position="top-center" richColors closeButton />

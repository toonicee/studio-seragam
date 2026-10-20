<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import type { LayoutProps } from './$types';
	import Toast from '$lib/components/Toast.svelte';

	let { children }: LayoutProps = $props();

	onMount(() => {
		const savedTheme = localStorage.getItem('studio-seragam:theme');
		if (savedTheme) {
			document.documentElement.setAttribute('data-theme', savedTheme);
		} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			document.documentElement.setAttribute('data-theme', 'dark');
		}
	});
</script>

<svelte:head>
	<title>Studio Seragam — Desain Seragam Kerja 3D</title>
</svelte:head>

{@render children()}
<Toast />

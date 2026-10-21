<script lang="ts">
	import '../../app.css';
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
	<meta name="description" content="Desain seragam kerja secara 3D: pilih model, warna, pola, logo bordir/sablon, lalu hitung jumlah per ukuran dan order langsung." />
	<meta property="og:title" content="Studio Seragam — Desain Seragam Kerja 3D" />
	<meta property="og:description" content="Visualizer 3D seragam kemeja, polo, kaos, dan rompi secara interaktif." />
	<meta name="theme-color" content="#e8ecee" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Instrument+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Roboto+Slab:wght@700&family=Dancing+Script:wght@700&display=swap" />
</svelte:head>

{@render children()}
<Toast />

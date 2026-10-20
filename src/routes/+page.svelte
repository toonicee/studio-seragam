<script lang="ts">
	import { onMount } from 'svelte';
	import { replaceState } from '$app/navigation';
	import { uniformStore } from '$lib/stores/uniform.svelte';
	import { PRODUCTS } from '$lib/constants/catalog';
	import type { ProductKey } from '$lib/types/uniform';
	import Header from '$lib/components/Header.svelte';
	import Canvas3D from '$lib/components/Canvas3D.svelte';
	import ModelTab from '$lib/components/ModelTab.svelte';
	import ColorTab from '$lib/components/ColorTab.svelte';
	import LogoTab from '$lib/components/LogoTab.svelte';
	import OrderTab from '$lib/components/OrderTab.svelte';
	import TapeFooter from '$lib/components/TapeFooter.svelte';
	import MockupModal from '$lib/components/MockupModal.svelte';
	import OrdersModal from '$lib/components/OrdersModal.svelte';

	let canvasComponent: { takeSnapshot: (view: 'front' | 'back') => string };
	let isMockupOpen = $state(false);
	let isOrdersOpen = $state(false);
	let isDark = $state(false);

	let frontSnapshot = $state('');
	let backSnapshot = $state('');

	onMount(() => {
		isDark = document.documentElement.getAttribute('data-theme') === 'dark';

		// Datang dari katalog (/?product=kaos): model sudah dipilih, langsung ke langkah Warna
		const pid = new URLSearchParams(location.search).get('product');
		if (pid && pid in PRODUCTS) {
			uniformStore.setProduct(pid as ProductKey);
			uniformStore.activeTab = 'warna';
			replaceState(location.pathname, {});
		}
	});

	function toggleTheme() {
		isDark = !isDark;
		const theme = isDark ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('studio-seragam:theme', theme);
	}

	function openMockup() {
		if (canvasComponent) {
			frontSnapshot = canvasComponent.takeSnapshot('front');
			backSnapshot = canvasComponent.takeSnapshot('back');
		}
		isMockupOpen = true;
	}

	function closeMockup() {
		isMockupOpen = false;
	}

	function openOrders() {
		isOrdersOpen = true;
	}

	function closeOrders() {
		isOrdersOpen = false;
	}

	const STEPS = [
		{ id: 'model', label: 'Model', hint: 'Pilih jenis seragam & bahan' },
		{ id: 'warna', label: 'Warna', hint: 'Pilih warna seragam' },
		{ id: 'logo', label: 'Logo', hint: 'Pasang logo di seragam' },
		{ id: 'order', label: 'Order', hint: 'Isi jumlah per ukuran & kirim' }
	] as const;

	let scrollEl: HTMLElement;
	const stepIdx = $derived(STEPS.findIndex(s => s.id === uniformStore.activeTab));

	function goStep(i: number) {
		const s = STEPS[i];
		if (!s) return;
		uniformStore.activeTab = s.id;
		scrollEl?.scrollTo({ top: 0 });
	}
</script>

<div class="wrapper">
	<Header
		onOpenMockup={openMockup}
		onOpenOrders={openOrders}
		onToggleTheme={toggleTheme}
		{isDark}
	/>

	<main class="app">
		<!-- Stage 3D Kiri -->
		<Canvas3D bind:this={canvasComponent} />

		<!-- Panel Pengaturan Kanan -->
		<aside class="panel" aria-label="Pengaturan seragam">
			<div class="tabs" role="tablist">
				{#each STEPS as s, i}
					<button
						type="button"
						role="tab"
						aria-selected={uniformStore.activeTab === s.id}
						class:done={i < stepIdx}
						onclick={() => goStep(i)}
					>
						<span>{i < stepIdx ? '✓' : i + 1}</span>{s.label}
					</button>
				{/each}
			</div>
			<p class="step-hint">
				<b>Langkah {stepIdx + 1} dari {STEPS.length}</b> · {STEPS[stepIdx]?.hint}
			</p>

			<div class="scroll" bind:this={scrollEl}>
				{#if uniformStore.activeTab === 'model'}
					<ModelTab />
				{:else if uniformStore.activeTab === 'warna'}
					<ColorTab />
				{:else if uniformStore.activeTab === 'logo'}
					<LogoTab />
				{:else if uniformStore.activeTab === 'order'}
					<OrderTab onOpenMockup={openMockup} />
				{/if}

				{#if stepIdx < STEPS.length - 1}
					<nav class="step-nav" aria-label="Navigasi langkah">
						{#if stepIdx > 0}
							<button type="button" class="step-back" onclick={() => goStep(stepIdx - 1)}>
								← {STEPS[stepIdx - 1].label}
							</button>
						{/if}
						<button type="button" class="step-next" onclick={() => goStep(stepIdx + 1)}>
							Lanjut: {STEPS[stepIdx + 1].label} →
						</button>
					</nav>
				{/if}
			</div>

			<TapeFooter onOpenMockup={openMockup} />
		</aside>
	</main>
</div>

<MockupModal
	isOpen={isMockupOpen}
	onClose={closeMockup}
	{frontSnapshot}
	{backSnapshot}
/>

<OrdersModal
	isOpen={isOrdersOpen}
	onClose={closeOrders}
/>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		height: 100vh;
		padding: 12px 16px;
		box-sizing: border-box;
	}

	.app {
		flex: 1;
		min-height: 0;
		display: grid;
		grid-template-columns: minmax(0, 1fr) 440px;
		gap: 16px;
	}

	.panel {
		min-height: 0;
		display: flex;
		flex-direction: column;
		background: var(--sheet, #ffffff);
		border: 1px solid var(--line, #d2d9de);
		border-radius: 16px;
		overflow: hidden;
	}

	.tabs {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		border-bottom: 1px solid var(--line, #d2d9de);
		background: var(--sheet, #ffffff);
		flex: none;
	}

	.tabs button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 7px;
		border: 0;
		background: transparent;
		padding: 14px 6px 12px;
		font: 600 14px/1 var(--f-body, sans-serif);
		color: var(--ink-3, #74808b);
		border-bottom: 3px solid transparent;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.tabs button span {
		display: inline-grid;
		place-items: center;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		font: 500 11px/1 var(--f-mono, monospace);
		border: 1px solid currentColor;
	}

	.tabs button[aria-selected='true'] {
		color: var(--ink, #17202a);
		border-bottom-color: var(--ink, #17202a);
	}

	.tabs button[aria-selected='true'] span {
		background: var(--ink, #17202a);
		color: var(--sheet, #ffffff);
		border-color: var(--ink, #17202a);
	}

	.tabs button.done span {
		background: #e35a12;
		border-color: #e35a12;
		color: #fff;
	}

	.step-hint {
		margin: 0;
		padding: 8px 20px;
		font-size: 12.5px;
		color: var(--ink-2, #4d5a66);
		background: var(--sheet-2, #f0f3f5);
		border-bottom: 1px solid var(--line, #d2d9de);
		flex: none;
	}

	.step-hint b {
		color: #e35a12;
		font-weight: 600;
	}

	.scroll {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
		-webkit-overflow-scrolling: touch;
	}

	.step-nav {
		display: flex;
		gap: 8px;
		padding: 0 20px 24px;
	}

	.step-nav button {
		min-height: 46px;
		padding: 0 16px;
		border-radius: 12px;
		font: 600 15px/1 var(--f-body, sans-serif);
		cursor: pointer;
	}

	.step-back {
		background: var(--sheet, #fff);
		color: var(--ink, #17202a);
		border: 1px solid var(--line, #d2d9de);
	}

	.step-next {
		flex: 1;
		background: #e35a12;
		color: #fff;
		border: 1px solid #e35a12;
	}

	.step-next:hover {
		background: #c94e0e;
	}

	/* Mobile: tampilan seperti aplikasi — pratinjau 3D tetap terlihat di atas,
	   panel pengaturan menggulir sendiri di bawahnya */
	@media (max-width: 900px) {
		.wrapper {
			height: 100dvh;
			padding: 8px 8px 0;
		}

		.app {
			display: flex;
			flex-direction: column;
			gap: 8px;
		}

		.panel {
			flex: 1;
			border-radius: 16px 16px 0 0;
			border-bottom: 0;
		}

		.tabs button {
			gap: 5px;
			padding: 0 2px;
			min-height: 46px;
			font-size: 13px;
		}

		.tabs button span {
			width: 20px;
			height: 20px;
		}

		.tabs button[aria-selected='true'] {
			border-bottom-color: #e35a12;
		}

		.tabs button[aria-selected='true'] span {
			background: #e35a12;
			border-color: #e35a12;
			color: #fff;
		}

		.step-hint {
			display: none;
		}

		.step-nav {
			position: sticky;
			bottom: 0;
			padding: 14px 16px 12px;
			background: linear-gradient(transparent, var(--sheet, #fff) 14px);
		}

		.step-nav button {
			min-height: 44px;
		}
	}
</style>

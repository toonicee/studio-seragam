<script lang="ts">
	import { onMount } from 'svelte';
	import { uniformStore } from '$lib/stores/uniform.svelte';
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
				<button
					type="button"
					role="tab"
					aria-selected={uniformStore.activeTab === 'model'}
					onclick={() => (uniformStore.activeTab = 'model')}
				>
					<span>1</span>Model
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={uniformStore.activeTab === 'warna'}
					onclick={() => (uniformStore.activeTab = 'warna')}
				>
					<span>2</span>Warna
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={uniformStore.activeTab === 'logo'}
					onclick={() => (uniformStore.activeTab = 'logo')}
				>
					<span>3</span>Logo
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={uniformStore.activeTab === 'order'}
					onclick={() => (uniformStore.activeTab = 'order')}
				>
					<span>4</span>Order
				</button>
			</div>

			<div class="scroll">
				{#if uniformStore.activeTab === 'model'}
					<ModelTab />
				{:else if uniformStore.activeTab === 'warna'}
					<ColorTab />
				{:else if uniformStore.activeTab === 'logo'}
					<LogoTab />
				{:else if uniformStore.activeTab === 'order'}
					<OrderTab onOpenMockup={openMockup} />
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

	.scroll {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
	}

	@media (max-width: 900px) {
		.wrapper {
			height: auto;
			min-height: 100vh;
			padding-bottom: 0;
		}

		.app {
			display: flex;
			flex-direction: column;
			gap: 12px;
		}

		:global(.stage) {
			height: 56svh;
			min-height: 340px;
			flex: none;
		}

		.panel {
			overflow: visible;
			border-radius: 16px 16px 0 0;
			border-bottom: 0;
		}

		.tabs {
			position: sticky;
			top: 0;
			z-index: 5;
		}

		.scroll {
			overflow: visible;
		}
	}
</style>

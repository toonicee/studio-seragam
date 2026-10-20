<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { uniformStore } from '$lib/stores/uniform.svelte';
	import { createThreeEngine, type ThreeEngine } from '$lib/three/engine';
	import { fmt } from '$lib/constants/catalog';

	let canvasEl: HTMLCanvasElement;
	let stageEl: HTMLElement;
	let engine: ThreeEngine | null = null;
	let isWebGLSupported = $state(true);
	let expanded = $state(false);
	let touched = $state(false);

	export function takeSnapshot(view: 'front' | 'back'): string {
		if (!engine) return '';
		return engine.takeSnapshot(view);
	}

	onMount(() => {
		try {
			engine = createThreeEngine(canvasEl, stageEl, (v) => {
				uniformStore.activeView = v as any;
			});

			// Initial build
			engine.buildShirt(uniformStore.state);
			engine.applyWeave(uniformStore.state);
			engine.paintAll(uniformStore.state, uniformStore.activeLogoCanvas, uniformStore.extraImgCanvas);
			engine.setView('front', true);
		} catch (err) {
			console.error('Failed to init Three.js engine:', err);
			isWebGLSupported = false;
		}
	});

	onDestroy(() => {
		engine?.destroy();
	});

	// Reactive effects to update 3D mesh and textures when state changes
	$effect(() => {
		// Track product, sleeve style, pocket count
		const pid = uniformStore.state.product;
		const sleeveStyle = uniformStore.state.sleeveStyle;
		const pocketCount = uniformStore.state.pocketCount[pid];

		if (engine && pid) {
			engine.buildShirt(uniformStore.state);
			engine.paintAll(uniformStore.state, uniformStore.activeLogoCanvas, uniformStore.extraImgCanvas);
		}
	});

	$effect(() => {
		// Track weave/material changes
		const pid = uniformStore.state.product;
		const mat = uniformStore.state.material[pid];
		if (engine && mat) {
			engine.applyWeave(uniformStore.state);
		}
	});

	$effect(() => {
		// Track colors, patterns, slots, logos, and vest flag
		const pid = uniformStore.state.product;
		const look = uniformStore.state.look[pid];
		const slots = uniformStore.state.slots;
		const slotOn = uniformStore.state.slotOn[pid];
		const vestFlag = uniformStore.state.vestFlag;
		const userLogo = uniformStore.activeLogoCanvas;
		const extraImg = uniformStore.extraImgCanvas;

		if (engine && look) {
			engine.paintAll(uniformStore.state, userLogo, extraImg);
		}
	});

	$effect(() => {
		// Track measurement overlay toggle
		const measureOn = uniformStore.state.measureOn;
		if (engine) {
			engine.setMeasure(uniformStore.state);
		}
	});

	function handleSetView(view: 'front' | 'back' | 'side') {
		uniformStore.isSpinning = false;
		uniformStore.activeView = view;
		engine?.setView(view);
	}

	function handleToggleSpin() {
		if (!engine) return;
		const spin = engine.toggleSpin();
		uniformStore.isSpinning = spin;
		if (spin) uniformStore.activeView = null;
	}

	function handleToggleMeasure() {
		uniformStore.state.measureOn = !uniformStore.state.measureOn;
		uniformStore.saveToLocalStorage();
	}
</script>

<section class="stage" class:expanded bind:this={stageEl} aria-label="Pratinjau 3D seragam">
	<canvas
		bind:this={canvasEl}
		id="gl"
		aria-label="Model 3D seragam"
		onpointerdown={() => (touched = true)}
	></canvas>

	<button
		type="button"
		class="expand"
		aria-pressed={expanded}
		aria-label={expanded ? 'Perkecil pratinjau' : 'Perbesar pratinjau'}
		onclick={() => (expanded = !expanded)}
	>
		{#if expanded}
			<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M8 3v5H3M12 17v-5h5M8 8 3 3M12 12l5 5"/></svg>
		{:else}
			<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M3 8V3h5M17 12v5h-5M3 3l5 5M17 17l-5-5"/></svg>
		{/if}
	</button>

	<!-- Tag Spesifikasi Kiri Atas -->
	<div class="tag">
		<span class="tag-kicker">
			{uniformStore.currentProduct.finish === 'bordir' ? 'Bordir' : 'Sablon DTF'}
			{uniformStore.currentProduct.minOrder
				? ` · min. ${uniformStore.currentProduct.minOrder} pcs`
				: ' · menyusul'}
		</span>
		<strong class="tag-name">{uniformStore.currentProduct.name}</strong>
		<span class="tag-mat">{uniformStore.currentMaterial.name}</span>
		<span class="tag-price">
			{#if uniformStore.hasPrice}
				<s>{fmt(uniformStore.currentMaterial.list)}</s>
				<b>{fmt(uniformStore.currentMaterial.promo)}</b>
				<small>/pcs</small>
			{:else}
				<b>Harga menyusul</b>
			{/if}
		</span>
	</div>

	{#if !isWebGLSupported}
		<div class="stage-msg">
			Pratinjau 3D WebGL tidak didukung pada browser ini. Pengaturan seragam dan kalkulator order tetap dapat digunakan.
		</div>
	{/if}

	<!-- View Control Floating Bar -->
	<div class="views" role="group" aria-label="Sudut pandang model 3D">
		<button
			type="button"
			aria-pressed={uniformStore.activeView === 'front'}
			onclick={() => handleSetView('front')}
		>
			Depan
		</button>
		<button
			type="button"
			aria-pressed={uniformStore.activeView === 'back'}
			onclick={() => handleSetView('back')}
		>
			Belakang
		</button>
		<button
			type="button"
			aria-pressed={uniformStore.activeView === 'side'}
			onclick={() => handleSetView('side')}
		>
			Samping
		</button>
		<button
			type="button"
			aria-pressed={uniformStore.isSpinning}
			onclick={handleToggleSpin}
		>
			Putar
		</button>
		<button
			type="button"
			aria-pressed={uniformStore.state.measureOn}
			onclick={handleToggleMeasure}
			title="Garis Lebar & Panjang seperti di katalog"
		>
			Ukuran
		</button>
	</div>

	<p class="hint desktop">Seret untuk memutar · scroll untuk zoom</p>
	{#if !touched}
		<p class="hint touch">
			<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 10h12M7 7l-3 3 3 3M13 7l3 3-3 3"/></svg>
			Geser untuk memutar · cubit untuk zoom
		</p>
	{/if}
</section>

<style>
	.stage {
		position: relative;
		min-height: 0;
		overflow: hidden;
		border: 1px solid var(--line, #d2d9de);
		border-radius: 16px;
		background-color: var(--stage, #e1e7ea);
		background-image: linear-gradient(var(--grid-2, rgba(36, 62, 84, 0.12)) 1px, transparent 1px),
			linear-gradient(90deg, var(--grid-2, rgba(36, 62, 84, 0.12)) 1px, transparent 1px),
			linear-gradient(var(--grid, rgba(36, 62, 84, 0.065)) 1px, transparent 1px),
			linear-gradient(90deg, var(--grid, rgba(36, 62, 84, 0.065)) 1px, transparent 1px);
		background-size: 60px 60px, 60px 60px, 12px 12px, 12px 12px;
		background-position: center center;
		height: 100%;
	}

	#gl {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
		touch-action: none;
	}

	.tag {
		position: absolute;
		top: 14px;
		left: 14px;
		z-index: 2;
		display: grid;
		gap: 1px;
		padding: 11px 16px 12px 34px;
		background: var(--tag, #fffdf7);
		border: 1px solid var(--line, #d2d9de);
		clip-path: polygon(16px 0, 100% 0, 100% 100%, 16px 100%, 0 calc(100% - 16px), 0 16px);
		box-shadow: var(--shadow, 0 1px 2px rgba(20, 30, 40, 0.07), 0 10px 28px rgba(20, 30, 40, 0.09));
		max-width: min(300px, calc(100% - 28px));
		pointer-events: none;
	}

	.tag::before {
		content: '';
		position: absolute;
		left: 11px;
		top: 50%;
		width: 9px;
		height: 9px;
		margin-top: -4.5px;
		border-radius: 50%;
		border: 1.5px solid var(--ink-3, #74808b);
		background: var(--stage, #e1e7ea);
	}

	.tag-kicker {
		font: 500 11px/1.2 var(--f-mono, monospace);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-3, #74808b);
	}

	.tag-name {
		font: 700 22px/1.05 var(--f-display, sans-serif);
		letter-spacing: 0.01em;
		text-transform: uppercase;
		text-wrap: balance;
		color: var(--ink, #17202a);
	}

	.tag-mat {
		font-size: 13px;
		color: var(--ink-2, #4d5a66);
	}

	.tag-price {
		margin-top: 4px;
		font: 500 14px/1.2 var(--f-mono, monospace);
		font-variant-numeric: tabular-nums;
		color: var(--ink, #17202a);
	}

	.tag-price s {
		color: var(--ink-3, #74808b);
		font-size: 12px;
		margin-right: 4px;
	}

	.tag-price small {
		color: var(--ink-3, #74808b);
		font-size: 11px;
	}

	.views {
		position: absolute;
		z-index: 2;
		left: 50%;
		transform: translateX(-50%);
		bottom: calc(14px + env(safe-area-inset-bottom, 0px));
		display: flex;
		gap: 2px;
		padding: 3px;
		background: var(--sheet, #ffffff);
		border: 1px solid var(--line, #d2d9de);
		border-radius: 999px;
		box-shadow: var(--shadow, 0 1px 2px rgba(20, 30, 40, 0.07), 0 10px 28px rgba(20, 30, 40, 0.09));
	}

	.views button {
		border: 0;
		background: transparent;
		padding: 7px 14px;
		border-radius: 999px;
		font: 600 13px/1 var(--f-body, sans-serif);
		color: var(--ink-2, #4d5a66);
		white-space: nowrap;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.views button[aria-pressed='true'] {
		background: var(--ink, #17202a);
		color: var(--sheet, #ffffff);
	}

	.views button:hover:not([aria-pressed='true']) {
		background: var(--sheet-2, #f0f3f5);
		color: var(--ink, #17202a);
	}

	.hint {
		position: absolute;
		right: 16px;
		bottom: 20px;
		margin: 0;
		font-size: 12px;
		color: var(--ink-3, #74808b);
		pointer-events: none;
	}

	.stage-msg {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		padding: 24px;
		text-align: center;
		font: 500 14px/1.5 var(--f-mono, monospace);
		color: var(--ink-2, #4d5a66);
		pointer-events: none;
	}

	.expand {
		display: none;
		position: absolute;
		z-index: 2;
		top: 10px;
		right: 10px;
		width: 40px;
		height: 40px;
		place-items: center;
		padding: 0;
		border-radius: 12px;
		border: 1px solid var(--line, #d2d9de);
		background: var(--sheet, #ffffff);
		color: var(--ink, #17202a);
		box-shadow: var(--shadow);
		cursor: pointer;
	}

	.expand svg {
		width: 18px;
		height: 18px;
	}

	.hint.touch {
		display: none;
	}

	@media (max-width: 900px) {
		/* Pratinjau tetap terlihat di atas panel; tombol perbesar untuk melihat detail */
		.stage {
			flex: none;
			height: 36dvh;
			min-height: 230px;
			transition: height 0.25s ease;
		}

		.stage.expanded {
			height: 68dvh;
		}

		.expand {
			display: grid;
		}

		.hint.desktop {
			display: none;
		}

		.hint.touch {
			display: flex;
			align-items: center;
			gap: 6px;
			left: 50%;
			right: auto;
			top: 50%;
			bottom: auto;
			transform: translate(-50%, -50%);
			padding: 7px 12px;
			border-radius: 999px;
			background: rgba(23, 32, 42, 0.72);
			color: #fff;
			font-size: 12.5px;
			white-space: nowrap;
			animation: hint-fade 4.5s ease forwards;
		}

		.hint.touch svg {
			width: 16px;
			height: 16px;
		}
	}

	@keyframes hint-fade {
		0%, 70% { opacity: 1; }
		100% { opacity: 0; visibility: hidden; }
	}

	@media (max-width: 600px) {
		/* Label ringkas satu baris agar tidak menutupi model */
		.tag {
			top: 8px;
			left: 8px;
			display: flex;
			flex-wrap: wrap;
			align-items: baseline;
			column-gap: 8px;
			padding: 6px 10px 6px 24px;
			max-width: calc(100% - 64px);
			clip-path: polygon(10px 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px), 0 10px);
		}

		.tag::before {
			left: 8px;
			width: 7px;
			height: 7px;
			margin-top: -3.5px;
		}

		.tag-kicker,
		.tag-mat,
		.tag-price s,
		.tag-price small {
			display: none;
		}

		.tag-name {
			font-size: 15px;
		}

		.tag-price {
			margin-top: 0;
			font-size: 12.5px;
		}

		.expand {
			top: 8px;
			right: 8px;
		}

		.views {
			bottom: 10px;
			max-width: calc(100% - 20px);
			overflow-x: auto;
			scrollbar-width: none;
		}

		.views::-webkit-scrollbar {
			display: none;
		}

		.views button {
			min-height: 36px;
			padding: 0 10px;
			font-size: 12px;
		}
	}
</style>

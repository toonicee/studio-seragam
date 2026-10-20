<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { loadDesignFromDb } from '$lib/supabase/service';
	import { uniformStore } from '$lib/stores/uniform.svelte';

	let isLoading = $state(true);
	let errorMsg = $state<string | null>(null);

	onMount(async () => {
		const id = page.params.id;
		if (!id) {
			goto('/');
			return;
		}

		try {
			const design = await loadDesignFromDb(id);
			if (design && design.state_data) {
				Object.assign(uniformStore.state, design.state_data);
				await uniformStore.initLogos();
				uniformStore.saveToLocalStorage();
				uniformStore.showToast('Desain seragam berhasil dimuat!', 'success');
				goto('/');
			} else {
				errorMsg = 'Desain tidak ditemukan atau tautan sudah kadaluarsa.';
				isLoading = false;
			}
		} catch (err: any) {
			errorMsg = err?.message || 'Gagal memuat desain seragam.';
			isLoading = false;
		}
	});
</script>

<div class="loader-container">
	{#if isLoading}
		<div class="loader-box">
			<div class="spinner"></div>
			<h2>Memuat Desain Seragam 3D...</h2>
			<p>Menyiapkan spesifikasi model, kain, dan logo.</p>
		</div>
	{:else}
		<div class="error-box">
			<h2>Oops!</h2>
			<p>{errorMsg}</p>
			<a href="/" class="btn-home">Buka Studio Seragam</a>
		</div>
	{/if}
</div>

<style>
	.loader-container {
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding: 24px;
		background: var(--paper, #e8ecee);
		color: var(--ink, #17202a);
	}

	.loader-box,
	.error-box {
		padding: 36px 40px;
		background: var(--sheet, #ffffff);
		border: 1px solid var(--line, #d2d9de);
		border-radius: 16px;
		text-align: center;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
		max-width: 440px;
		width: 100%;
	}

	.spinner {
		width: 44px;
		height: 44px;
		border: 4px solid var(--line, #d2d9de);
		border-top-color: var(--chalk, #2f5bd0);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin: 0 auto 20px;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	h2 {
		margin: 0 0 8px;
		font: 700 22px/1.2 var(--f-display, sans-serif);
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}

	p {
		margin: 0 0 20px;
		color: var(--ink-2, #4d5a66);
		font-size: 14px;
	}

	.btn-home {
		display: inline-block;
		padding: 10px 20px;
		border-radius: 10px;
		background: var(--ink, #17202a);
		color: var(--sheet, #ffffff);
		text-decoration: none;
		font-weight: 600;
		font-size: 14px;
	}
</style>

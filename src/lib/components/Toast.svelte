<script lang="ts">
	import { uniformStore } from '$lib/stores/uniform.svelte';
</script>

<div class="toast-container" aria-live="polite">
	{#each uniformStore.toasts as toast (toast.id)}
		<div class="toast show {toast.type || 'info'}">
			{toast.message}
		</div>
	{/each}
</div>

<style>
	.toast-container {
		position: fixed;
		left: 50%;
		bottom: calc(96px + env(safe-area-inset-bottom, 0px));
		transform: translateX(-50%);
		z-index: 9999;
		display: flex;
		flex-direction: column;
		gap: 8px;
		pointer-events: none;
	}

	.toast {
		padding: 10px 18px;
		border-radius: 10px;
		background: var(--ink, #17202a);
		color: var(--sheet, #ffffff);
		font-size: 14px;
		font-weight: 600;
		box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
		transition: opacity 0.2s ease, transform 0.2s ease;
		white-space: nowrap;
		text-align: center;
	}

	.toast.success {
		background: var(--ok, #1b7a45);
		color: #ffffff;
	}

	.toast.warn {
		background: var(--warn, #9c4507);
		color: #ffffff;
	}
</style>

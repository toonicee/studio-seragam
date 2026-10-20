<script lang="ts">
	import { uniformStore } from '$lib/stores/uniform.svelte';
	import { fmt } from '$lib/constants/catalog';

	let { onOpenMockup }: { onOpenMockup: () => void } = $props();

	const qtyDisplay = $derived(
		uniformStore.hasPrice && uniformStore.currentMaterial.promo
			? `${uniformStore.totalQty} pcs × ${fmt(uniformStore.currentMaterial.promo)}`
			: `${uniformStore.totalQty} pcs`
	);

	const totalDisplay = $derived(
		uniformStore.hasPrice && uniformStore.totalPrice != null
			? fmt(uniformStore.totalPrice)
			: 'Harga menyusul'
	);

	const statusText = $derived(() => {
		const min = uniformStore.currentProduct.minOrder;
		const n = uniformStore.totalQty;
		if (!min) {
			return n ? 'Harga & minimal order dikonfirmasi oleh admin' : 'Isi jumlah per ukuran di tab Order';
		}
		if (n === 0) return 'Isi jumlah per ukuran di tab Order';
		if (n < min) return `Kurang ${min - n} pcs dari minimal order ${min} pcs`;
		return min > 1 ? `Memenuhi minimal order ${min} pcs` : 'Bisa dipesan mulai 1 pcs';
	});
</script>

<footer class="tape">
	<div class="tape-info">
		<span class="tape-qty">{qtyDisplay}</span>
		<strong class="tape-total">{totalDisplay}</strong>
		<span class="tape-status">{statusText()}</span>
	</div>
	<button type="button" class="btn-tape" onclick={onOpenMockup}>
		Lihat Mockup & Order
	</button>
</footer>

<style>
	.tape {
		position: relative;
		flex: none;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 20px 16px 13px 18px;
		background: var(--tape, #f2c42c);
		color: var(--tape-ink, #1f1a07);
	}

	.tape::before {
		content: '';
		position: absolute;
		inset: 0 0 auto 0;
		height: 11px;
		opacity: 0.8;
		background-image: repeating-linear-gradient(90deg, var(--tape-ink, #1f1a07) 0 1px, transparent 1px 40px),
			repeating-linear-gradient(90deg, var(--tape-ink, #1f1a07) 0 1px, transparent 1px 8px);
		background-size: 100% 11px, 100% 5px;
		background-repeat: no-repeat;
	}

	.tape-info {
		display: grid;
		gap: 1px;
		min-width: 0;
	}

	.tape-qty {
		font: 500 12px/1.2 var(--f-mono, monospace);
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.tape-total {
		font: 700 28px/1 var(--f-display, sans-serif);
		letter-spacing: 0.01em;
		font-variant-numeric: tabular-nums;
	}

	.tape-status {
		font-size: 12.5px;
		font-weight: 600;
	}

	.btn-tape {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 10px 16px;
		border-radius: 10px;
		font-weight: 600;
		font-size: 14px;
		background: var(--tape-ink, #1f1a07);
		border: 1px solid var(--tape-ink, #1f1a07);
		color: var(--tape, #f2c42c);
		cursor: pointer;
		white-space: nowrap;
		transition: opacity 0.15s ease;
	}

	.btn-tape:hover {
		opacity: 0.9;
	}

	@media (max-width: 600px) {
		.tape {
			padding: 16px 14px calc(10px + env(safe-area-inset-bottom, 0px)) 14px;
		}
		.tape-total {
			font-size: 22px;
		}
		.tape-status {
			font-size: 11.5px;
		}
		.btn-tape {
			padding: 8px 12px;
			font-size: 13px;
		}
	}
</style>

<script lang="ts">
	import { fetchRecentOrders } from '$lib/supabase/service';
	import { fmt } from '$lib/constants/catalog';
	import type { DbOrder } from '$lib/types/uniform';

	let { isOpen, onClose }: { isOpen: boolean; onClose: () => void } = $props();

	let orders = $state<DbOrder[]>([]);
	let isLoading = $state(false);

	$effect(() => {
		if (isOpen) {
			loadOrders();
		}
	});

	async function loadOrders() {
		isLoading = true;
		orders = await fetchRecentOrders();
		isLoading = false;
	}

	function formatDate(iso?: string) {
		if (!iso) return '–';
		try {
			return new Date(iso).toLocaleDateString('id-ID', {
				day: 'numeric',
				month: 'short',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return iso;
		}
	}
</script>

{#if isOpen}
	<div
		class="modal-backdrop"
		onclick={(e) => e.target === e.currentTarget && onClose()}
		role="presentation"
	>
		<div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="orders-title">
			<div class="modal-head">
				<h2 id="orders-title" class="modal-title">Daftar Pesanan &amp; Penawaran</h2>
				<button type="button" class="btn-close" onclick={onClose} aria-label="Tutup jendela">
					&times;
				</button>
			</div>

			<div class="modal-body">
				{#if isLoading}
					<div class="empty-state">Memuat riwayat pesanan dari database...</div>
				{:else if orders.length === 0}
					<div class="empty-state">
						<p>Belum ada pesanan yang tercatat.</p>
						<small>Desain seragam Anda, pilih ukuran, lalu klik "Kirim Order ke Database" untuk membuat pesanan.</small>
					</div>
				{:else}
					<div class="orders-list">
						{#each orders as ord}
							<div class="order-item">
								<div class="order-header">
									<div class="order-main-info">
										<strong class="order-prod">{ord.product_name}</strong>
										<span class="order-mat">{ord.material_name} · {ord.total_qty} pcs</span>
									</div>
									<span class="status-pill status-{ord.status}">
										{ord.status}
									</span>
								</div>

								<div class="order-details">
									<div class="detail-row">
										<span>Pemesan:</span>
										<b>{ord.customer_name} {ord.customer_org ? `(${ord.customer_org})` : ''}</b>
									</div>
									{#if ord.customer_phone}
										<div class="detail-row">
											<span>WhatsApp:</span>
											<span>{ord.customer_phone}</span>
										</div>
									{/if}
									{#if ord.total_price}
										<div class="detail-row">
											<span>Total Estimasi:</span>
											<b class="price-val">{fmt(ord.total_price)}</b>
										</div>
									{/if}
									<div class="detail-row">
										<span>Waktu Pesan:</span>
										<small>{formatDate(ord.created_at)}</small>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		z-index: 1000;
		background: rgba(10, 14, 18, 0.65);
		display: grid;
		place-items: center;
		padding: 16px;
		backdrop-filter: blur(4px);
	}

	.modal-card {
		width: min(720px, 100%);
		max-height: calc(100vh - 40px);
		display: flex;
		flex-direction: column;
		background: var(--sheet, #ffffff);
		border: 1px solid var(--line, #d2d9de);
		border-radius: 16px;
		color: var(--ink, #17202a);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
		overflow: hidden;
	}

	.modal-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		border-bottom: 1px solid var(--line, #d2d9de);
	}

	.modal-title {
		margin: 0;
		font: 700 20px/1.2 var(--f-display, sans-serif);
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}

	.btn-close {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		border: 0;
		background: transparent;
		font-size: 24px;
		line-height: 1;
		color: var(--ink-3, #74808b);
		cursor: pointer;
	}

	.modal-body {
		padding: 20px;
		overflow-y: auto;
	}

	.empty-state {
		text-align: center;
		padding: 40px 20px;
		color: var(--ink-3, #74808b);
	}

	.orders-list {
		display: grid;
		gap: 12px;
	}

	.order-item {
		padding: 14px 16px;
		border-radius: 12px;
		border: 1px solid var(--line, #d2d9de);
		background: var(--sheet-2, #f0f3f5);
		display: grid;
		gap: 10px;
	}

	.order-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12px;
	}

	.order-prod {
		font-size: 16px;
		font-weight: 700;
		color: var(--ink, #17202a);
		display: block;
	}

	.order-mat {
		font-size: 12.5px;
		color: var(--ink-2, #4d5a66);
	}

	.status-pill {
		padding: 4px 10px;
		border-radius: 20px;
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.status-pending {
		background: #fef3c7;
		color: #92400e;
	}

	.status-dikonfirmasi {
		background: #dbeafe;
		color: #1e40af;
	}

	.status-diproses {
		background: #e0e7ff;
		color: #3730a3;
	}

	.status-selesai {
		background: #dcfce7;
		color: #166534;
	}

	.status-dibatalkan {
		background: #fee2e2;
		color: #991b1b;
	}

	.order-details {
		display: grid;
		gap: 4px;
		font-size: 13px;
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		gap: 8px;
	}

	.detail-row span {
		color: var(--ink-3, #74808b);
	}

	.price-val {
		font-family: var(--f-mono, monospace);
		color: var(--ink, #17202a);
	}
</style>

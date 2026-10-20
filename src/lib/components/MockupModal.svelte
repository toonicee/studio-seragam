<script lang="ts">
	import { uniformStore } from '$lib/stores/uniform.svelte';
	import { saveDesignToDb, submitOrderToDb } from '$lib/supabase/service';
	import { isSupabaseConfigured } from '$lib/supabase/client';

	let {
		isOpen,
		onClose,
		frontSnapshot = '',
		backSnapshot = ''
	}: {
		isOpen: boolean;
		onClose: () => void;
		frontSnapshot: string;
		backSnapshot: string;
	} = $props();

	let summaryText = $state('');
	let shareLink = $state<string | null>(null);
	let isSubmitting = $state(false);
	let orderSuccessId = $state<string | null>(null);

	$effect(() => {
		if (isOpen) {
			summaryText = uniformStore.getSummaryText();
			shareLink = null;
			orderSuccessId = null;
		}
	});

	async function copyText() {
		try {
			await navigator.clipboard.writeText(summaryText);
			uniformStore.showToast('Ringkasan berhasil disalin untuk WhatsApp!', 'success');
		} catch {
			uniformStore.showToast('Gagal menyalin otomatis, silakan salin teks secara manual.');
		}
	}

	async function handleSaveDesign() {
		isSubmitting = true;
		const res = await saveDesignToDb(uniformStore.state, frontSnapshot, backSnapshot);
		isSubmitting = false;

		if (res.success) {
			const origin = typeof window !== 'undefined' ? window.location.origin : '';
			shareLink = `${origin}/design/${res.slug || res.id}`;
			uniformStore.showToast('Desain seragam berhasil disimpan ke Database!', 'success');
		} else {
			uniformStore.showToast(res.error || 'Gagal menyimpan desain', 'warn');
		}
	}

	async function handleSubmitOrder() {
		if (!uniformStore.state.customer.name.trim()) {
			uniformStore.showToast('Mohon lengkapi Nama Anda di tab Order', 'warn');
			return;
		}
		if (!uniformStore.state.customer.phone?.trim()) {
			uniformStore.showToast('Mohon lengkapi No. WhatsApp di tab Order', 'warn');
			return;
		}

		isSubmitting = true;
		const res = await submitOrderToDb({
			customer_name: uniformStore.state.customer.name,
			customer_org: uniformStore.state.customer.org,
			customer_phone: uniformStore.state.customer.phone || '',
			customer_email: uniformStore.state.customer.email,
			notes: uniformStore.state.customer.note,
			total_qty: uniformStore.totalQty,
			total_price: uniformStore.totalPrice,
			product_name: uniformStore.currentProduct.name,
			material_name: uniformStore.currentMaterial.name,
			breakdown: uniformStore.state.qty[uniformStore.state.product] || {},
			summary_text: summaryText,
			preview_front: frontSnapshot,
			preview_back: backSnapshot
		});
		isSubmitting = false;

		if (res.success) {
			orderSuccessId = res.id || 'ok';
			uniformStore.showToast('Pesanan berhasil masuk ke Database!', 'success');
		} else {
			uniformStore.showToast(res.error || 'Gagal mengirim order', 'warn');
		}
	}

	async function copyShareLink() {
		if (!shareLink) return;
		try {
			await navigator.clipboard.writeText(shareLink);
			uniformStore.showToast('Tautan desain berhasil disalin!', 'success');
		} catch {}
	}
</script>

{#if isOpen}
	<div class="modal-backdrop" onclick={(e) => e.target === e.currentTarget && onClose()} role="presentation">
		<div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
			<div class="modal-head">
				<h2 id="modal-title" class="modal-title">Pratinjau Mockup &amp; Order</h2>
				<button type="button" class="btn-close" onclick={onClose} aria-label="Tutup jendela">
					&times;
				</button>
			</div>

			<div class="modal-body">
				<!-- HD Mockup Renders -->
				<div class="shots">
					<figure>
						{#if frontSnapshot}
							<img src={frontSnapshot} alt="Mockup Tampak Depan" />
						{:else}
							<div class="shot-placeholder">Memuat render depan...</div>
						{/if}
						<figcaption>Tampak Depan</figcaption>
					</figure>
					<figure>
						{#if backSnapshot}
							<img src={backSnapshot} alt="Mockup Tampak Belakang" />
						{:else}
							<div class="shot-placeholder">Memuat render belakang...</div>
						{/if}
						<figcaption>Tampak Belakang</figcaption>
					</figure>
				</div>

				{#if orderSuccessId}
					<div class="success-banner">
						<div class="success-icon">✓</div>
						<div>
							<strong>Pesanan Berhasil Disimpan!</strong>
							<p>Nomor Tiket: #{orderSuccessId.slice(0, 8)}</p>
							<small>Data pesanan telah dicatat di database. Tim Studio Seragam akan memverifikasi spesifikasi bordir & pola Anda.</small>
						</div>
					</div>
				{/if}

				{#if shareLink}
					<div class="share-box">
						<span class="share-label">Link Berbagi Desain 3D:</span>
						<div class="share-row">
							<input type="text" readonly value={shareLink} class="share-input" />
							<button type="button" class="btn-ink btn-sm" onclick={copyShareLink}>
								Salin Link
							</button>
						</div>
					</div>
				{/if}

				<!-- Summary Textarea -->
				<div class="summary-sec">
					<label for="summaryText" class="lbl">Format Pesanan WhatsApp &amp; Arsip</label>
					<textarea id="summaryText" bind:value={summaryText} rows="8"></textarea>
				</div>

				<!-- Action Buttons -->
				<div class="modal-actions">
					<button type="button" class="btn-ink" onclick={copyText}>
						<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
							<path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
							<path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
						</svg>
						<span>Salin Teks WhatsApp</span>
					</button>

					<button
						type="button"
						class="btn-line"
						disabled={isSubmitting}
						onclick={handleSaveDesign}
					>
						<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
							<path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
						</svg>
						<span>{isSubmitting ? 'Menyimpan...' : 'Simpan & Dapatkan Link'}</span>
					</button>

					<button
						type="button"
						class="btn-primary"
						disabled={isSubmitting}
						onclick={handleSubmitOrder}
					>
						<span>{isSubmitting ? 'Mengirim...' : 'Kirim Order ke Database'}</span>
					</button>
				</div>
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
		width: min(860px, 100%);
		max-height: calc(100vh - 32px);
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
		font: 700 22px/1.2 var(--f-display, sans-serif);
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

	.btn-close:hover {
		background: var(--sheet-2, #f0f3f5);
		color: var(--ink, #17202a);
	}

	.modal-body {
		padding: 20px;
		overflow-y: auto;
		display: grid;
		gap: 18px;
	}

	.shots {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}

	.shots figure {
		margin: 0;
		display: grid;
		gap: 6px;
	}

	.shots img {
		width: 100%;
		aspect-ratio: 4 / 5;
		object-fit: contain;
		border-radius: 12px;
		border: 1px solid var(--line, #d2d9de);
		background-color: var(--stage, #e1e7ea);
		background-image: linear-gradient(var(--grid, rgba(36, 62, 84, 0.065)) 1px, transparent 1px),
			linear-gradient(90deg, var(--grid, rgba(36, 62, 84, 0.065)) 1px, transparent 1px);
		background-size: 12px 12px;
	}

	.shot-placeholder {
		width: 100%;
		aspect-ratio: 4 / 5;
		display: grid;
		place-items: center;
		border-radius: 12px;
		border: 1px solid var(--line, #d2d9de);
		background: var(--sheet-2, #f0f3f5);
		font-size: 13px;
		color: var(--ink-3, #74808b);
	}

	.shots figcaption {
		font: 500 11px/1 var(--f-mono, monospace);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-3, #74808b);
		text-align: center;
	}

	.success-banner {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		border-radius: 10px;
		background: var(--ok-bg, #dcf0e3);
		color: var(--ok, #1b7a45);
	}

	.success-icon {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--ok, #1b7a45);
		color: #ffffff;
		display: grid;
		place-items: center;
		font-weight: 700;
		flex: none;
	}

	.share-box {
		display: grid;
		gap: 6px;
		padding: 12px;
		border-radius: 10px;
		background: var(--sheet-2, #f0f3f5);
		border: 1px solid var(--line, #d2d9de);
	}

	.share-label {
		font-size: 12px;
		font-weight: 600;
		color: var(--ink-2, #4d5a66);
	}

	.share-row {
		display: flex;
		gap: 8px;
	}

	.share-input {
		flex: 1;
		padding: 8px 12px;
		border-radius: 8px;
		border: 1px solid var(--line, #d2d9de);
		background: var(--sheet, #ffffff);
		font: 500 13px var(--f-mono, monospace);
		color: var(--ink, #17202a);
	}

	.summary-sec {
		display: grid;
		gap: 6px;
	}

	.lbl {
		font: 600 12px/1.2 var(--f-body, sans-serif);
		text-transform: uppercase;
		letter-spacing: 0.09em;
		color: var(--ink-3, #74808b);
	}

	#summaryText {
		width: 100%;
		padding: 12px;
		border-radius: 10px;
		border: 1px solid var(--line, #d2d9de);
		background: var(--sheet-2, #f0f3f5);
		font: 400 12.5px/1.55 var(--f-mono, monospace);
		color: var(--ink, #17202a);
		resize: vertical;
	}

	.modal-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.btn-ink,
	.btn-line,
	.btn-primary {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 10px 16px;
		border-radius: 10px;
		font-weight: 600;
		font-size: 14px;
		cursor: pointer;
		white-space: nowrap;
	}

	.btn-ink {
		background: var(--ink, #17202a);
		color: var(--sheet, #ffffff);
		border: 1px solid var(--ink, #17202a);
	}

	.btn-line {
		background: var(--sheet, #ffffff);
		color: var(--ink, #17202a);
		border: 1px solid var(--line, #d2d9de);
	}

	.btn-primary {
		background: #2563eb;
		color: #ffffff;
		border: 1px solid #2563eb;
		margin-left: auto;
	}

	.btn-primary:hover {
		background: #1d4ed8;
	}

	@media (max-width: 600px) {
		.shots {
			grid-template-columns: 1fr;
		}

		.btn-primary {
			margin-left: 0;
			width: 100%;
		}
	}
</style>

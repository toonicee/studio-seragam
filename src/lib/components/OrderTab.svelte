<script lang="ts">
	import { uniformStore } from '$lib/stores/uniform.svelte';
	import { WEIGHT_GUIDE, fmt } from '$lib/constants/catalog';

	let { onOpenMockup }: { onOpenMockup: () => void } = $props();

	function weightLabel(z: string): string {
		const guide = WEIGHT_GUIDE[z];
		if (!guide) return '–';
		const [lo, hi] = guide;
		return z === 'XS' ? `< ${hi} kg` : `${lo}–${hi} kg`;
	}

	const rec = $derived(uniformStore.recommendSize());

	async function copySummary() {
		const text = uniformStore.getSummaryText();
		try {
			await navigator.clipboard.writeText(text);
			uniformStore.showToast('Ringkasan pesanan berhasil disalin!', 'success');
		} catch {
			onOpenMockup();
			uniformStore.showToast('Salin teks secara manual dari jendela ringkasan');
		}
	}
</script>

<div class="tabpanel">
	<!-- Ukuran & Jumlah -->
	<div class="sec">
		<h2 class="h">Ukuran &amp; jumlah</h2>
		<div class="tbl-wrap">
			<table class="sizes">
				<thead>
					<tr>
						<th scope="col">Ukuran</th>
						<th scope="col">Panjang</th>
						<th scope="col">Lebar</th>
						<th scope="col" class="col-w">Berat ±</th>
						<th scope="col">Jumlah</th>
					</tr>
				</thead>
				<tbody>
					{#each uniformStore.currentProduct.sizes as [z, pl, lb]}
						{@const isRec = rec && rec.size === z}
						{@const curQty = uniformStore.state.qty[uniformStore.state.product]?.[z] || 0}
						<tr class={isRec ? 'rec' : ''}>
							<th scope="row">
								{z}
								{#if isRec}
									<span class="badge-rec">saran</span>
								{/if}
							</th>
							<td>{pl ? `${pl} cm` : '–'}</td>
							<td>{lb ? `${lb} cm` : '–'}</td>
							<td class="col-w">{weightLabel(z)}</td>
							<td>
								<div class="step">
									<button
										type="button"
										aria-label="Kurangi {z}"
										onclick={() => uniformStore.setQty(z, -1)}
									>
										−
									</button>
									<input
										type="number"
										inputmode="numeric"
										min="0"
										max="9999"
										value={curQty}
										aria-label="Jumlah ukuran {z}"
										oninput={(e) => uniformStore.setQty(z, +e.currentTarget.value || 0, true)}
									/>
									<button
										type="button"
										aria-label="Tambah {z}"
										onclick={() => uniformStore.setQty(z, 1)}
									>
										+
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
				<tfoot>
					<tr>
						<th colspan="3" scope="row">Total</th>
						<td class="col-w"></td>
						<td>{uniformStore.totalQty} pcs</td>
					</tr>
				</tfoot>
			</table>
		</div>
		<p class="note">
			Panjang badan × lebar dada baju dari katalog standar (cm). Kolom berat adalah estimasi umum.
		</p>
	</div>

	<!-- Saran Ukuran -->
	<div class="sec">
		<h3 class="lbl">Kalkulator Saran Ukuran</h3>
		<div class="rec-fields">
			<label class="fld">
				<span>Berat badan (kg)</span>
				<input
					type="number"
					min="25"
					max="200"
					placeholder="mis. 68"
					value={uniformStore.state.weight}
					oninput={(e) => {
						uniformStore.state.weight = e.currentTarget.value;
						uniformStore.saveToLocalStorage();
					}}
				/>
			</label>
			<label class="fld">
				<span>Tinggi (cm) · opsional</span>
				<input
					type="number"
					min="120"
					max="220"
					placeholder="mis. 170"
					value={uniformStore.state.height}
					oninput={(e) => {
						uniformStore.state.height = e.currentTarget.value;
						uniformStore.saveToLocalStorage();
					}}
				/>
			</label>
			<label class="fld">
				<span>Lingkar dada (cm) · opsional</span>
				<input
					type="number"
					min="50"
					max="200"
					placeholder="mis. 96"
					value={uniformStore.state.chest}
					oninput={(e) => {
						uniformStore.state.chest = e.currentTarget.value;
						uniformStore.saveToLocalStorage();
					}}
				/>
			</label>
		</div>

		<div class="rec-out" aria-live="polite">
			{#if !rec}
				<span class="rec-big">–</span>
				<span>Isi berat badan untuk melihat rekomendasi ukuran baju yang paling nyaman.</span>
			{:else if rec.over}
				<span class="rec-big">?</span>
				<span>
					Melebihi ukuran standar terbesar ({uniformStore.currentProduct.sizes[uniformStore.currentProduct.sizes.length - 1][0]}). Hubungi admin kami untuk ukuran custom.
				</span>
			{:else}
				<span class="rec-big">{rec.size}</span>
				<span>
					Rekomendasi ukuran: <b>{rec.size}</b>.
					{#if rec.byW}
						(Berat {rec.kg} kg → {rec.byW.size})
					{/if}
					{#if rec.byC}
						, Lingkar dada {rec.cm} cm → lebar {rec.byC.lebar} cm.
					{/if}
					{#if rec.tallUp}
						Tinggi {rec.tb} cm: pertimbangkan <b>{rec.tallUp}</b> untuk panjang baju ekstra.
					{/if}
				</span>
			{/if}
		</div>
	</div>

	<!-- Rincian Harga -->
	<div class="sec">
		<h3 class="lbl">Rincian Harga</h3>
		<dl class="price">
			{#if !uniformStore.hasPrice}
				<dt>Harga / pcs</dt>
				<dd>Menyusul</dd>
				<dt>Jumlah Pesanan</dt>
				<dd>{uniformStore.totalQty} pcs</dd>
				<dt class="tot">Estimasi Total</dt>
				<dd class="tot">–</dd>
			{:else}
				{@const m = uniformStore.currentMaterial}
				<dt>Harga normal katalog</dt>
				<dd><s>{fmt(m.list)}</s></dd>
				<dt>Harga promo spesial / pcs</dt>
				<dd>{fmt(m.promo)}</dd>
				<dt>Jumlah Pesanan</dt>
				<dd>{uniformStore.totalQty} pcs</dd>
				{#if m.list && m.promo}
					<dt class="save">Hemat promo</dt>
					<dd class="save">
						{fmt(uniformStore.totalQty * (m.list - m.promo))}
					</dd>
				{/if}
				<dt class="tot">Total Estimasi</dt>
				<dd class="tot">{fmt(uniformStore.totalPrice)}</dd>
			{/if}
		</dl>
	</div>

	<!-- Data Pemesan -->
	<div class="sec">
		<h3 class="lbl">Data Pemesan / PIC</h3>
		<div class="row2">
			<label class="fld">
				<span>Nama Lengkap *</span>
				<input
					type="text"
					placeholder="Nama Anda"
					value={uniformStore.state.customer.name}
					oninput={(e) => {
						uniformStore.state.customer.name = e.currentTarget.value;
						uniformStore.saveToLocalStorage();
					}}
				/>
			</label>
			<label class="fld">
				<span>Instansi / Perusahaan</span>
				<input
					type="text"
					placeholder="Nama PT / Organisasi"
					value={uniformStore.state.customer.org}
					oninput={(e) => {
						uniformStore.state.customer.org = e.currentTarget.value;
						uniformStore.saveToLocalStorage();
					}}
				/>
			</label>
		</div>

		<div class="row2">
			<label class="fld">
				<span>No. WhatsApp *</span>
				<input
					type="text"
					placeholder="08xxxxxxxxxx"
					value={uniformStore.state.customer.phone || ''}
					oninput={(e) => {
						uniformStore.state.customer.phone = e.currentTarget.value;
						uniformStore.saveToLocalStorage();
					}}
				/>
			</label>
			<label class="fld">
				<span>Email</span>
				<input
					type="email"
					placeholder="email@perusahaan.com"
					value={uniformStore.state.customer.email || ''}
					oninput={(e) => {
						uniformStore.state.customer.email = e.currentTarget.value;
						uniformStore.saveToLocalStorage();
					}}
				/>
			</label>
		</div>

		<label class="fld">
			<span>Catatan Pesanan</span>
			<textarea
				rows="2"
				placeholder="Mis. target tanggal acara, opsi bordir nama per orang, alamat pengiriman"
				value={uniformStore.state.customer.note}
				oninput={(e) => {
					uniformStore.state.customer.note = e.currentTarget.value;
					uniformStore.saveToLocalStorage();
				}}
			></textarea>
		</label>
	</div>

	<!-- Actions -->
	<div class="sec actions">
		<button type="button" class="btn-ink" onclick={copySummary}>
			Salin Ringkasan Order
		</button>
		<button type="button" class="btn-line" onclick={onOpenMockup}>
			Lihat Mockup & Simpan
		</button>
	</div>
</div>

<style>
	.tabpanel {
		padding: 20px 20px 28px;
		display: grid;
		gap: 26px;
	}

	.sec {
		display: grid;
		gap: 12px;
		min-width: 0;
	}

	.h {
		margin: 0;
		font: 700 24px/1 var(--f-display, sans-serif);
		text-transform: uppercase;
		letter-spacing: 0.01em;
		text-wrap: balance;
		color: var(--ink, #17202a);
	}

	.lbl {
		margin: 0;
		font: 600 12px/1.2 var(--f-body, sans-serif);
		text-transform: uppercase;
		letter-spacing: 0.09em;
		color: var(--ink-3, #74808b);
	}

	.note {
		margin: 0;
		font-size: 13px;
		color: var(--ink-2, #4d5a66);
	}

	.tbl-wrap {
		overflow-x: auto;
		border: 1px solid var(--line, #d2d9de);
		border-radius: 12px;
	}

	table.sizes {
		width: 100%;
		border-collapse: collapse;
		font-variant-numeric: tabular-nums;
	}

	.sizes th,
	.sizes td {
		padding: 7px 8px;
		text-align: left;
		border-bottom: 1px solid var(--line, #d2d9de);
		white-space: nowrap;
	}

	.sizes th:first-child,
	.sizes td:first-child {
		padding-left: 12px;
	}

	.sizes td:last-child,
	.sizes th:last-child {
		padding-right: 12px;
	}

	.sizes thead th {
		font: 600 11.5px/1.2 var(--f-body, sans-serif);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--ink-3, #74808b);
		background: var(--sheet-2, #f0f3f5);
	}

	.sizes tbody th {
		font: 700 16px/1 var(--f-display, sans-serif);
		letter-spacing: 0.02em;
		color: var(--ink, #17202a);
	}

	.sizes td {
		font: 400 12.5px var(--f-mono, monospace);
		color: var(--ink-2, #4d5a66);
	}

	.sizes tfoot th,
	.sizes tfoot td {
		border-bottom: 0;
		font-weight: 600;
		color: var(--ink, #17202a);
	}

	.sizes tfoot td {
		font: 600 14px var(--f-mono, monospace);
		padding-left: 34px;
	}

	.sizes tr.rec th,
	.sizes tr.rec td {
		background: color-mix(in srgb, var(--tape, #f2c42c) 26%, transparent);
	}

	.badge-rec {
		margin-left: 6px;
		font: 500 10px/1 var(--f-mono, monospace);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		vertical-align: middle;
		padding: 3px 5px;
		border-radius: 4px;
		background: var(--tape, #f2c42c);
		color: var(--tape-ink, #1f1a07);
	}

	.step {
		display: inline-flex;
		align-items: center;
		border: 1px solid var(--line, #d2d9de);
		border-radius: 9px;
		overflow: hidden;
		background: var(--sheet, #ffffff);
	}

	.step button {
		width: 26px;
		height: 32px;
		border: 0;
		background: transparent;
		font-size: 17px;
		line-height: 1;
		color: var(--ink-2, #4d5a66);
		cursor: pointer;
	}

	.step button:hover {
		background: var(--sheet-2, #f0f3f5);
		color: var(--ink, #17202a);
	}

	.step input {
		width: 42px;
		height: 32px;
		border: 0;
		border-inline: 1px solid var(--line, #d2d9de);
		text-align: center;
		font: 500 14px var(--f-mono, monospace);
		background: var(--sheet, #ffffff);
		color: var(--ink, #17202a);
		appearance: textfield;
		-moz-appearance: textfield;
	}

	.step input::-webkit-outer-spin-button,
	.step input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.rec-fields {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 10px;
		align-items: end;
	}

	.rec-out {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: 12px;
		align-items: center;
		padding: 10px 12px;
		border-radius: 10px;
		background: color-mix(in srgb, var(--tape, #f2c42c) 22%, var(--sheet, #ffffff));
		font-size: 13px;
		line-height: 1.4;
		color: var(--ink-2, #4d5a66);
	}

	.rec-big {
		display: inline-grid;
		place-items: center;
		min-width: 52px;
		height: 52px;
		padding: 0 8px;
		border-radius: 10px;
		background: var(--tape, #f2c42c);
		color: var(--tape-ink, #1f1a07);
		font: 700 26px/1 var(--f-display, sans-serif);
		letter-spacing: 0.02em;
	}

	dl.price {
		margin: 0;
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 8px 12px;
		font-size: 14px;
	}

	dl.price dt {
		color: var(--ink-2, #4d5a66);
	}

	dl.price dd {
		margin: 0;
		text-align: right;
		font: 500 14px var(--f-mono, monospace);
		font-variant-numeric: tabular-nums;
		color: var(--ink, #17202a);
	}

	dl.price .tot {
		padding-top: 10px;
		border-top: 1px solid var(--line, #d2d9de);
		color: var(--ink, #17202a);
		font-weight: 600;
	}

	dl.price dd.tot {
		font: 700 24px/1 var(--f-display, sans-serif);
		letter-spacing: 0.01em;
	}

	dl.price .save {
		color: var(--ok, #1b7a45);
	}

	.fld {
		display: grid;
		gap: 5px;
		min-width: 0;
	}

	.fld > span {
		font-size: 12.5px;
		font-weight: 600;
		color: var(--ink-2, #4d5a66);
	}

	.fld input,
	.fld textarea {
		width: 100%;
		padding: 9px 11px;
		border-radius: 9px;
		border: 1px solid var(--line, #d2d9de);
		background: var(--sheet, #ffffff);
		color: var(--ink, #17202a);
	}

	.row2 {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.btn-ink,
	.btn-line {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 10px 16px;
		border-radius: 10px;
		font-weight: 600;
		font-size: 14px;
		cursor: pointer;
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

	@media (max-width: 460px) {
		.rec-fields {
			grid-template-columns: 1fr 1fr;
		}
		.rec-fields .fld:first-child {
			grid-column: 1 / -1;
		}
		.row2 {
			grid-template-columns: 1fr;
		}
	}
</style>

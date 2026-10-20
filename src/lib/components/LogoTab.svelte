<script lang="ts">
	import { uniformStore } from '$lib/stores/uniform.svelte';
	import { SLOT_DEFS, FONTS, THREADS } from '$lib/constants/catalog';
	import { placeholderLogo } from '$lib/three/textures';
	import { CLIENT_CONFIG } from '$lib/client-config';

	// Kaos & polo: cukup unggah logo. Produk lain memakai logo klien yang terkunci.
	const logoOnly = $derived(Boolean(uniformStore.currentProduct.logoOnly));
	const canUpload = $derived(logoOnly || !CLIENT_CONFIG.lockLogo);

	let fileInputEl = $state<HTMLInputElement>();
	let extraInputEl = $state<HTMLInputElement>();

	function getThumbSrc(): string {
		const canvas = uniformStore.activeLogoCanvas || placeholderLogo('#1b2129');
		try {
			return canvas.toDataURL();
		} catch {
			return '';
		}
	}

	function getExtraThumbSrc(): string {
		if (uniformStore.extraImgCanvas) {
			try {
				return uniformStore.extraImgCanvas.toDataURL();
			} catch {
				return '';
			}
		}
		return '';
	}

	async function handleLogoUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			const f = target.files[0];
			if (f.size > 8 * 1024 * 1024) {
				uniformStore.showToast('File terlalu besar. Maksimal 8 MB.', 'warn');
				return;
			}
			const reader = new FileReader();
			reader.onload = async () => {
				await uniformStore.setLogo(reader.result as string);
				uniformStore.showToast('Logo berhasil dipasang');
			};
			reader.readAsDataURL(f);
		}
	}

	async function handleExtraUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			const f = target.files[0];
			if (f.size > 8 * 1024 * 1024) {
				uniformStore.showToast('File terlalu besar. Maksimal 8 MB.', 'warn');
				return;
			}
			const reader = new FileReader();
			reader.onload = async () => {
				await uniformStore.setExtraImage(reader.result as string);
				uniformStore.showToast('Gambar tambahan dipasang di punggung');
			};
			reader.readAsDataURL(f);
		}
	}
</script>

<div class="tabpanel">
	<!-- Logo Box Upload -->
	<div class="sec">
		<h2 class="h">{logoOnly ? 'Logo' : 'Logo & teks'}</h2>
		<div class="logo-box">
			<div class="logo-thumb">
				<img src={getThumbSrc()} alt="Pratinjau logo seragam" />
			</div>
			<div class="logo-actions">
				{#if canUpload}
					<div class="btn-row">
						<label class="btn-ink btn-sm" for="logoFileInput">
							{uniformStore.hasProductLogo ? 'Ganti logo' : 'Unggah logo'}
						</label>
						<input
							bind:this={fileInputEl}
							type="file"
							id="logoFileInput"
							class="vh"
							accept="image/png,image/jpeg,image/svg+xml,image/webp"
							onchange={handleLogoUpload}
						/>
						{#if logoOnly ? uniformStore.hasProductLogo : uniformStore.state.logoSrc}
							<button
								type="button"
								class="btn-line btn-sm"
								onclick={() => uniformStore.setLogo(null)}
							>
								{logoOnly ? `Pakai logo ${CLIENT_CONFIG.name}` : 'Pakai logo contoh'}
							</button>
						{/if}
					</div>
					<label class="chk">
						<input
							type="checkbox"
							checked={uniformStore.state.removeWhite}
							onchange={(e) => uniformStore.setRemoveWhite(e.currentTarget.checked)}
						/>
						<span>Hapus latar putih otomatis</span>
					</label>
					<span class="note">
						{#if logoOnly}
							{uniformStore.hasProductLogo
								? 'Logo Anda dipakai di semua posisi yang aktif.'
								: `Masih memakai logo ${CLIENT_CONFIG.name}. Unggah PNG transparan untuk menggantinya.`}
						{:else}
							{uniformStore.state.logoSrc
								? 'Logo kustom Anda aktif di semua posisi seragam.'
								: 'Masih memakai logo placeholder. Unggah file PNG transparan untuk hasil terbaik.'}
						{/if}
					</span>
				{:else}
					<b class="locked">Logo resmi {CLIENT_CONFIG.name}</b>
					<span class="note">Logo sudah ditetapkan untuk model ini dan dibordir sesuai posisi di bawah.</span>
				{/if}
			</div>
		</div>

		<!-- Finish badge -->
		<div class="finish">
			<b>{uniformStore.currentProduct.finish === 'bordir' ? 'Bordir' : 'Sablon DTF'}</b>
			<span>
				{uniformStore.currentProduct.includes[uniformStore.currentProduct.collar === 'shirt' ? 2 : 0] ||
					'Bordir logo & teks sesuai posisi yang dipilih'}
			</span>
		</div>
	</div>

	<!-- Posisi Slot -->
	<div class="sec">
		<div class="color-row">
			<h3 class="lbl">Posisi Penempatan</h3>
			<button
				type="button"
				class="btn-line btn-sm"
				onclick={() => uniformStore.applyCatalogLayout()}
			>
				Atur seperti katalog
			</button>
		</div>

		<div class="slots">
			{#each uniformStore.currentProduct.slots as id}
				{@const d = SLOT_DEFS[id]}
				{@const s = uniformStore.state.slots[id]}
				{@const on = Boolean(uniformStore.state.slotOn[uniformStore.state.product]?.[id])}
				{@const isBordir = uniformStore.currentProduct.finish === 'bordir'}

				<div class="slot {on ? '' : 'off'}">
					<div class="slot-head">
						<label class="switch">
							<input
								type="checkbox"
								checked={on}
								aria-label="Aktifkan {d.label}"
								onchange={(e) => uniformStore.setSlotOn(id, e.currentTarget.checked)}
							/>
							<span></span>
						</label>
						<div>
							<b>{d.label}</b>
							<small>{logoOnly ? 'Logo' : d.hint}</small>
						</div>
					</div>

					{#if on}
						<div class="slot-body">
							{#if !logoOnly}
								<label class="chk">
									<input
										type="checkbox"
										checked={s.logo}
										onchange={(e) => uniformStore.setSlotProp(id, 'logo', e.currentTarget.checked)}
									/>
									<span>Tampilkan logo</span>
								</label>

								<label class="fld">
									<span>Teks</span>
									{#if d.multi}
										<textarea
											rows="2"
											maxlength="60"
											placeholder="Mis. alamat website perusahaan"
											value={s.text}
											oninput={(e) => uniformStore.setSlotProp(id, 'text', e.currentTarget.value)}
										></textarea>
									{:else}
										<input
											type="text"
											maxlength="28"
											placeholder={id === 'dadaKanan' ? 'Nama karyawan' : 'Opsional'}
											value={s.text}
											oninput={(e) => uniformStore.setSlotProp(id, 'text', e.currentTarget.value)}
										/>
									{/if}
								</label>

								{#if d.extraH}
									<div class="fld">
										<span>Gambar tambahan di bawah teks</span>
										<div class="extra-row">
											{#if uniformStore.extraImgCanvas}
												<span class="extra-thumb">
													<img src={getExtraThumbSrc()} alt="Gambar tambahan" />
												</span>
											{/if}
											<label class="btn-line btn-sm" for="extraFileInput">
												{uniformStore.extraImgCanvas ? 'Ganti gambar' : 'Unggah gambar'}
											</label>
											<input
												bind:this={extraInputEl}
												type="file"
												id="extraFileInput"
												class="vh"
												accept="image/png,image/jpeg,image/svg+xml,image/webp"
												onchange={handleExtraUpload}
											/>
											{#if uniformStore.extraImgCanvas}
												<button
													type="button"
													class="btn-line btn-sm"
													onclick={() => uniformStore.setExtraImage(null)}
												>
													Hapus
												</button>
											{/if}
										</div>
										<small class="note">Mis. gambar badge sertifikasi ISO atau App Store seperti katalog.</small>
									</div>
								{/if}

								<div class="row2">
									<label class="fld">
										<span>Jenis Huruf</span>
										<select
											value={s.font}
											onchange={(e) => uniformStore.setSlotProp(id, 'font', e.currentTarget.value)}
										>
											{#each Object.entries(FONTS) as [k, f]}
												<option value={k}>{f.label}</option>
											{/each}
										</select>
									</label>

									<div class="fld">
										<span>Warna {isBordir ? 'benang' : 'tinta'}</span>
										<div class="swatches sm">
											{#each THREADS as [name, hex]}
												{@const active = s.color.toLowerCase() === hex.toLowerCase()}
												<button
													type="button"
													class="sw-btn {hex === 'auto' ? 'sw-auto' : ''}"
													style="--c: {hex === 'auto' ? uniformStore.look.accent : hex}"
													aria-pressed={active}
													aria-label={name}
													title={name}
													onclick={() => uniformStore.setSlotProp(id, 'color', hex)}
												></button>
											{/each}
										</div>
									</div>
								</div>
							{/if}

							<div class="row2">
								<label class="fld">
									<span>Ukuran Proporsional ({s.size}x)</span>
									<input
										type="range"
										min="0.6"
										max="1.6"
										step="0.05"
										value={s.size}
										oninput={(e) => uniformStore.setSlotProp(id, 'size', +e.currentTarget.value)}
									/>
								</label>
								<label class="fld">
									<span>Naik / Turun ({s.dy > 0 ? `+${s.dy}` : s.dy})</span>
									<input
										type="range"
										min="-0.1"
										max="0.08"
										step="0.005"
										value={s.dy}
										oninput={(e) => uniformStore.setSlotProp(id, 'dy', +e.currentTarget.value)}
									/>
								</label>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
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

	.locked {
		font-size: 14px;
		color: var(--ink, #17202a);
	}

	.logo-box {
		display: grid;
		grid-template-columns: 88px minmax(0, 1fr);
		gap: 14px;
		align-items: center;
	}

	.logo-thumb {
		width: 88px;
		height: 88px;
		border-radius: 12px;
		border: 1px solid var(--line, #d2d9de);
		background-color: var(--sheet-2, #f0f3f5);
		background-image: linear-gradient(45deg, var(--grid-2, rgba(36, 62, 84, 0.12)) 25%, transparent 25%, transparent 75%, var(--grid-2, rgba(36, 62, 84, 0.12)) 75%),
			linear-gradient(45deg, var(--grid-2, rgba(36, 62, 84, 0.12)) 25%, transparent 25%, transparent 75%, var(--grid-2, rgba(36, 62, 84, 0.12)) 75%);
		background-size: 12px 12px;
		background-position: 0 0, 6px 6px;
		display: grid;
		place-items: center;
		overflow: hidden;
	}

	.logo-thumb img {
		max-width: 76px;
		max-height: 76px;
	}

	.logo-actions {
		display: grid;
		gap: 8px;
		justify-items: start;
		min-width: 0;
	}

	.btn-row {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.btn-ink,
	.btn-line {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 10px 16px;
		border-radius: 10px;
		font-weight: 600;
		font-size: 14px;
		line-height: 1.1;
		white-space: nowrap;
		cursor: pointer;
	}

	.btn-ink {
		background: var(--ink, #17202a);
		color: var(--sheet, #ffffff);
		border: 1px solid var(--ink, #17202a);
	}

	.btn-ink:hover {
		opacity: 0.9;
	}

	.btn-line {
		background: var(--sheet, #ffffff);
		color: var(--ink, #17202a);
		border: 1px solid var(--line, #d2d9de);
	}

	.btn-line:hover {
		border-color: var(--ink-3, #74808b);
	}

	.btn-sm {
		padding: 7px 12px;
		font-size: 13px;
	}

	input[type='file'].vh {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
		pointer-events: none;
	}

	.finish {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		border-radius: 10px;
		background: var(--sheet-2, #f0f3f5);
		font-size: 13px;
		color: var(--ink-2, #4d5a66);
	}

	.finish b {
		font: 500 11px/1 var(--f-mono, monospace);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		padding: 5px 8px;
		border-radius: 6px;
		background: var(--ink, #17202a);
		color: var(--sheet, #ffffff);
		white-space: nowrap;
	}

	.slots {
		display: grid;
		gap: 10px;
	}

	.slot {
		border: 1px solid var(--line, #d2d9de);
		border-radius: 12px;
		background: var(--sheet, #ffffff);
	}

	.slot-head {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 14px;
	}

	.slot-head div {
		min-width: 0;
	}

	.slot-head b {
		display: block;
		font: 700 16px/1.1 var(--f-display, sans-serif);
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--ink, #17202a);
	}

	.slot-head small {
		display: block;
		font-size: 12px;
		color: var(--ink-3, #74808b);
	}

	.slot-body {
		display: grid;
		gap: 12px;
		padding: 2px 14px 14px;
		border-top: 1px dashed var(--line, #d2d9de);
		padding-top: 12px;
	}

	.switch {
		position: relative;
		flex: none;
		width: 38px;
		height: 22px;
	}

	.switch input {
		position: absolute;
		inset: 0;
		opacity: 0;
		margin: 0;
		cursor: pointer;
		z-index: 1;
	}

	.switch span {
		position: absolute;
		inset: 0;
		border-radius: 999px;
		background: var(--line, #d2d9de);
		transition: background 0.15s;
	}

	.switch span::after {
		content: '';
		position: absolute;
		top: 3px;
		left: 3px;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--sheet, #ffffff);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
		transition: transform 0.15s;
	}

	.switch input:checked + span {
		background: var(--ink, #17202a);
	}

	.switch input:checked + span::after {
		transform: translateX(16px);
	}

	.chk {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		color: var(--ink, #17202a);
		cursor: pointer;
	}

	.chk input {
		width: 17px;
		height: 17px;
		accent-color: var(--ink, #17202a);
		margin: 0;
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

	.fld input[type='text'],
	.fld textarea,
	.fld select {
		width: 100%;
		padding: 9px 11px;
		border-radius: 9px;
		border: 1px solid var(--line, #d2d9de);
		background: var(--sheet, #ffffff);
		color: var(--ink, #17202a);
	}

	.fld textarea {
		resize: vertical;
		min-height: 64px;
	}

	.row2 {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}

	input[type='range'] {
		width: 100%;
		accent-color: var(--ink, #17202a);
	}

	.extra-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
	}

	.extra-thumb {
		display: inline-grid;
		place-items: center;
		width: 64px;
		height: 36px;
		border-radius: 8px;
		border: 1px solid var(--line, #d2d9de);
		background: var(--sheet-2, #f0f3f5);
		overflow: hidden;
	}

	.extra-thumb img {
		max-width: 58px;
		max-height: 30px;
	}

	.swatches {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.sw-btn {
		position: relative;
		width: 30px;
		height: 30px;
		border-radius: 50%;
		padding: 0;
		border: 1px solid rgba(0, 0, 0, 0.18);
		background: var(--c);
		cursor: pointer;
	}

	.sw-btn[aria-pressed='true']::after {
		content: '';
		position: absolute;
		inset: -5px;
		border-radius: 50%;
		border: 2px solid var(--ink, #17202a);
	}

	.swatches.sm .sw-btn {
		width: 24px;
		height: 24px;
	}

	.sw-auto {
		background: conic-gradient(#f4f4f0 0 50%, #1b2129 0 100%);
	}

	.color-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}
</style>

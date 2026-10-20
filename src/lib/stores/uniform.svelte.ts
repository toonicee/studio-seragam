import {
	DEFAULT_STATE,
	STORE_KEY,
	LEGACY_STORE_KEY,
	PRODUCTS,
	SLOT_DEFS,
	FONTS,
	WEIGHT_GUIDE,
	SIZE_ORDER,
	patternOf,
	colorName,
	fmt,
	autoInk
} from '$lib/constants/catalog';
import { CLIENT_CONFIG } from '$lib/client-config';
import type {
	UniformState,
	ProductKey,
	SlotKey,
	SizeRecommendation
} from '$lib/types/uniform';
import { decodeTo } from '$lib/three/textures';

export class UniformStore {
	state = $state<UniformState>(structuredClone(DEFAULT_STATE));
	activeTab = $state<'model' | 'warna' | 'logo' | 'order'>('model');
	activeView = $state<'front' | 'back' | 'side' | null>('front');
	isSpinning = $state(false);
	isSaving = $state(false);

	userLogoCanvas = $state<HTMLCanvasElement | null>(null);
	/** Logo unggahan untuk produk `logoOnly` (kaos, polo) */
	productLogoCanvas = $state<Partial<Record<ProductKey, HTMLCanvasElement | null>>>({});
	extraImgCanvas = $state<HTMLCanvasElement | null>(null);

	toasts = $state<{ id: number; message: string; type: 'info' | 'success' | 'warn' }[]>([]);
	private toastCounter = 0;

	constructor() {
		if (typeof window !== 'undefined') {
			this.loadFromLocalStorage();
			// Selalu enforce warna klien setelah load dari storage
			this.enforceClientColors();
			this.enforcePlainProducts();
			this.initLogos();
		}
	}

	/** Kunci warna ke brand Indah Express di semua produk */
	private enforceClientColors() {
		if (!CLIENT_CONFIG.lockColors) return;
		const products = Object.keys(this.state.look) as ProductKey[];
		for (const pid of products) {
			this.state.look[pid].body = CLIENT_CONFIG.bodyColor;
			this.state.look[pid].accent = CLIENT_CONFIG.accentColor;
			(this.state.look[pid] as any).button = CLIENT_CONFIG.buttonColor;
		}
	}

	/** Kaos & polo tidak punya pilihan pola: selalu polos */
	private enforcePlainProducts() {
		for (const pid of Object.keys(PRODUCTS) as ProductKey[]) {
			if (PRODUCTS[pid].logoOnly && this.state.look[pid]) this.state.look[pid].pattern = 'polos';
		}
	}

	async initLogos() {
		// Auto-preload logo Indah Express jika lockLogo aktif
		if (CLIENT_CONFIG.lockLogo) {
			try {
				const logoUrl = CLIENT_CONFIG.logoUrl;
				this.state.logoSrc = logoUrl;
				// Pastikan logo tampil: aktifkan dada kiri hanya jika produk belum punya posisi logo
				// yang menyala (mis. kaos sudah pakai "depan tengah" → jangan dobel logo)
				const slot = CLIENT_CONFIG.defaultLogoSlot;
				const products = Object.keys(this.state.slotOn) as ProductKey[];
				for (const pid of products) {
					const on = this.state.slotOn[pid];
					if (!on || !PRODUCTS[pid].slots.includes(slot)) continue;
					const hasLogo = PRODUCTS[pid].slots.some(id => on[id] && this.state.slots[id].logo);
					if (!hasLogo) on[slot] = true;
				}
				this.state.slots[slot].logo = true;
				this.userLogoCanvas = await decodeTo(logoUrl, false);
			} catch {
				console.warn('[Studio] Gagal load logo klien:', CLIENT_CONFIG.name);
			}
		} else if (this.state.logoSrc) {
			try {
				this.userLogoCanvas = await decodeTo(this.state.logoSrc, this.state.removeWhite);
			} catch {
				this.userLogoCanvas = null;
			}
		}
		for (const [pid, src] of Object.entries(this.state.productLogo || {}) as [ProductKey, string | null][]) {
			if (!src) continue;
			try {
				this.productLogoCanvas[pid] = await decodeTo(src, this.state.removeWhite);
			} catch {
				this.productLogoCanvas[pid] = null;
			}
		}
		if (this.state.slots.punggung.extraSrc) {
			try {
				this.extraImgCanvas = await decodeTo(this.state.slots.punggung.extraSrc, false);
			} catch {
				this.extraImgCanvas = null;
			}
		}
	}

	showToast(message: string, type: 'info' | 'success' | 'warn' = 'info') {
		const id = ++this.toastCounter;
		this.toasts.push({ id, message, type });
		setTimeout(() => {
			this.toasts = this.toasts.filter(t => t.id !== id);
		}, 2600);
	}

	get currentProduct() {
		return PRODUCTS[this.state.product];
	}

	get currentMaterial() {
		const curMatId = this.state.material[this.state.product];
		return this.currentProduct.materials.find(m => m.id === curMatId) || this.currentProduct.materials[0];
	}

	/** Logo yang tampil di produk aktif: unggahan (kaos/polo) atau logo klien */
	get activeLogoCanvas() {
		const pid = this.state.product;
		return (PRODUCTS[pid].logoOnly && this.productLogoCanvas[pid]) || this.userLogoCanvas;
	}

	/** Produk aktif memakai logo unggahan sendiri */
	get hasProductLogo() {
		return Boolean(this.currentProduct.logoOnly && this.state.productLogo?.[this.state.product]);
	}

	get look() {
		return this.state.look[this.state.product];
	}

	get totalQty() {
		const q = this.state.qty[this.state.product] || {};
		return this.currentProduct.sizes.reduce((sum, [z]) => sum + (+q[z] || 0), 0);
	}

	get hasPrice() {
		return this.currentMaterial.promo != null;
	}

	get totalPrice() {
		if (!this.hasPrice || this.currentMaterial.promo == null) return null;
		return this.totalQty * this.currentMaterial.promo;
	}

	get minOrderMet() {
		const min = this.currentProduct.minOrder;
		if (min == null) return true;
		return this.totalQty >= min;
	}

	setProduct(pid: ProductKey) {
		if (this.state.product === pid) return;
		this.state.product = pid;
		this.saveToLocalStorage();
	}

	setMaterial(mid: string) {
		this.state.material[this.state.product] = mid;
		this.saveToLocalStorage();
	}

	setPattern(patId: string) {
		if (this.currentProduct.logoOnly) return;
		this.state.look[this.state.product].pattern = patId;
		this.saveToLocalStorage();
	}

	setColor(target: 'body' | 'accent' | 'accent2' | 'button' | 'lining', hex: string) {
		// Jika warna dikunci untuk klien ini, abaikan perubahan
		if (CLIENT_CONFIG.lockColors && (target === 'body' || target === 'accent')) {
			return;
		}
		(this.state.look[this.state.product] as any)[target] = hex;
		this.saveToLocalStorage();
	}

	setSleeveStyle(style: 'panjang' | 'gulung') {
		this.state.sleeveStyle = style;
		this.saveToLocalStorage();
	}

	setPocketCount(count: number) {
		this.state.pocketCount[this.state.product] = count;
		this.saveToLocalStorage();
	}

	setVestFlag(checked: boolean) {
		this.state.vestFlag = checked;
		this.saveToLocalStorage();
	}

	setSlotOn(slot: SlotKey, checked: boolean) {
		this.state.slotOn[this.state.product][slot] = checked;
		this.saveToLocalStorage();
	}

	setSlotProp(slot: SlotKey, key: string, val: any) {
		(this.state.slots[slot] as any)[key] = val;
		this.saveToLocalStorage();
	}

	async setLogo(base64: string | null) {
		// Kaos & polo: logo bebas diunggah per produk, tidak ikut kunci logo klien
		const pid = this.state.product;
		if (PRODUCTS[pid].logoOnly) {
			this.state.productLogo = { ...this.state.productLogo, [pid]: base64 };
			this.productLogoCanvas[pid] = base64 ? await decodeTo(base64, this.state.removeWhite) : null;
			this.saveToLocalStorage();
			return;
		}
		// Jika logo dikunci, tidak izinkan penggantian
		if (CLIENT_CONFIG.lockLogo) {
			this.showToast('Logo Indah Expres sudah terkunci untuk klien ini', 'warn');
			return;
		}
		this.state.logoSrc = base64;
		if (base64) {
			this.userLogoCanvas = await decodeTo(base64, this.state.removeWhite);
		} else {
			this.userLogoCanvas = null;
		}
		this.saveToLocalStorage();
	}

	async setRemoveWhite(val: boolean) {
		this.state.removeWhite = val;
		// Logo klien yang dikunci punya panah putih — jangan ikut dihapus latarnya
		if (this.state.logoSrc && !CLIENT_CONFIG.lockLogo) {
			this.userLogoCanvas = await decodeTo(this.state.logoSrc, val);
		}
		for (const [pid, src] of Object.entries(this.state.productLogo || {}) as [ProductKey, string | null][]) {
			if (src) this.productLogoCanvas[pid] = await decodeTo(src, val);
		}
		this.saveToLocalStorage();
	}

	async setExtraImage(base64: string | null) {
		this.state.slots.punggung.extraSrc = base64;
		if (base64) {
			this.extraImgCanvas = await decodeTo(base64, false);
		} else {
			this.extraImgCanvas = null;
		}
		this.saveToLocalStorage();
	}

	setQty(size: string, deltaOrExact: number, isExact = false) {
		const curQ = this.state.qty[this.state.product] || (this.state.qty[this.state.product] = {});
		if (isExact) {
			curQ[size] = Math.max(0, Math.floor(deltaOrExact));
		} else {
			curQ[size] = Math.max(0, (+curQ[size] || 0) + deltaOrExact);
		}
		this.saveToLocalStorage();
	}

	applyCatalogLayout() {
		const extra = this.state.slots.punggung.extraSrc;
		this.state.slots = structuredClone(DEFAULT_STATE.slots);
		this.state.slots.punggung.extraSrc = extra;
		this.state.slotOn = structuredClone(DEFAULT_STATE.slotOn);
		this.saveToLocalStorage();
		this.showToast('Posisi logo & teks mengikuti katalog');
	}

	recommendSize(): SizeRecommendation | null {
		const P = this.currentProduct;
		const avail = P.sizes.map(s => s[0]);
		const kg = parseFloat(this.state.weight);
		const cm = parseFloat(this.state.chest);
		const tb = parseFloat(this.state.height);

		const r: SizeRecommendation = {
			byW: null,
			byC: null,
			size: null,
			over: false,
			tallUp: null,
			kg,
			cm,
			tb
		};

		if (kg >= 25 && kg <= 200) {
			let i = SIZE_ORDER.findIndex(z => kg < WEIGHT_GUIDE[z][1]);
			if (i >= 0) {
				while (i < SIZE_ORDER.length && !avail.includes(SIZE_ORDER[i])) i++;
				if (i < SIZE_ORDER.length) r.byW = { size: SIZE_ORDER[i] };
				else r.over = true;
			} else r.over = true;
		}

		if (cm >= 50 && cm <= 200 && P.sizes.some(r0 => r0[2])) {
			const hit = P.sizes.find(([, , lb]) => lb && lb * 2 >= cm + P.ease);
			r.byC = hit ? { size: hit[0], lebar: hit[2]! } : null;
			if (!hit) r.over = true;
		}

		const cands = [r.byW, r.byC].filter(Boolean) as { size: string }[];
		if (!cands.length) return null;
		if (r.over) return r;

		r.size = cands.map(c => c.size).sort((a, b) => avail.indexOf(b) - avail.indexOf(a))[0];
		if (tb >= 178) {
			const i = avail.indexOf(r.size);
			const row = P.sizes[i];
			if (row && row[1] && row[1] < 75 && i < avail.length - 1) {
				r.tallUp = avail[i + 1];
			}
		}
		return r;
	}

	getSummaryText(): string {
		const P = this.currentProduct;
		const m = this.currentMaterial;
		const n = this.totalQty;
		const L = this.look;
		const pat = PRODUCTS[this.state.product] ? (patternOf(L.pattern)) : null;

		const out = ['*PESANAN SERAGAM*', `Produk : ${P.name}`, `Bahan  : ${m.name}`];
		if (this.state.product === 'kemejaPanjang') {
			out.push(`Lengan : ${this.state.sleeveStyle === 'gulung' ? 'bisa digulung (tali gulung + kancing)' : 'panjang, manset berkancing'}`);
		}
		out.push(
			`Warna  : badan ${colorName(L.body)}` +
				(L.pattern !== 'polos' && pat
					? `, aksen ${colorName(L.accent)}${pat.c3 ? `, list ${colorName(L.accent2 || '#c8ccce')}` : ''} (pola ${pat.name.toLowerCase()})`
					: ' (polos)')
		);

		if (P.collar === 'stand') {
			out.push(`Furing : ${colorName(L.lining || '#1c1d20')}${this.state.vestFlag ? ' · patch bendera Merah Putih' : ''}`);
		}
		if (P.pockets) {
			const cnt = this.state.pocketCount[this.state.product] ?? 2;
			out.push(`Saku   : ${cnt === 1 ? '1 saku di dada kiri' : '2 saku (dada kiri & kanan)'}`);
		}
		if (P.buttons) {
			out.push(`Kancing: ${L.button === 'auto' ? 'senada badan' : L.button === 'accent' ? 'warna aksen' : colorName(L.button)}`);
		}
		out.push(`${P.finish === 'bordir' ? 'Bordir' : 'Sablon DTF'}:`);

		let anySlot = false;
		for (const id of P.slots) {
			if (!this.state.slotOn[this.state.product]?.[id]) continue;
			const s = this.state.slots[id];
			if (P.logoOnly) {
				// Kaos & polo: cukup logo (full color sesuai file), tanpa teks
				anySlot = true;
				out.push(`- ${SLOT_DEFS[id].label}: ${this.hasProductLogo ? 'logo unggahan pemesan' : `logo ${CLIENT_CONFIG.name}`}`);
				continue;
			}
			const bits: string[] = [];
			if (s.logo) bits.push(this.state.logoSrc ? 'logo' : 'logo (file menyusul)');
			if (s.text.trim()) bits.push(`teks "${s.text.trim().replace(/\n/g, ' / ')}" huruf ${(FONTS[s.font] || FONTS.tegas).label.toLowerCase()}`);
			if (id === 'punggung' && this.state.slots.punggung.extraSrc) bits.push('gambar tambahan');
			if (!bits.length) continue;
			anySlot = true;
			const col = s.color === 'auto' ? autoInk(L.body) : s.color;
			out.push(`- ${SLOT_DEFS[id].label}: ${bits.join(' + ')}, warna ${colorName(col).toLowerCase()}`);
		}
		if (!anySlot) out.push(P.logoOnly ? '- (tanpa logo)' : '- (tanpa logo/teks)');

		const qMap = this.state.qty[this.state.product] || {};
		const sizes = P.sizes.filter(([z]) => +qMap[z] > 0).map(([z]) => `${z}: ${qMap[z]}`);
		out.push(`Ukuran : ${sizes.length ? sizes.join(', ') : '-'}`);
		out.push(`Jumlah : ${n} pcs${P.minOrder && n < P.minOrder ? ` (minimal order ${P.minOrder} pcs)` : ''}`);

		if (this.hasPrice && m.promo) {
			out.push(`Harga  : ${fmt(m.promo)}/pcs (normal ${fmt(m.list)})`);
			out.push(`Total  : ${fmt(n * m.promo)}`);
		} else {
			out.push('Harga  : menyusul dari admin');
		}

		const c = this.state.customer;
		if (c.name || c.org) out.push(`Pemesan: ${[c.name, c.org].filter(Boolean).join(' – ')}`);
		if (c.phone) out.push(`Kontak : ${c.phone}`);
		if (c.note?.trim()) out.push(`Catatan: ${c.note.trim()}`);

		return out.join('\n');
	}

	saveToLocalStorage() {
		if (typeof window === 'undefined') return;
		try {
			localStorage.setItem(STORE_KEY, JSON.stringify(this.state));
		} catch {
			try {
				const lite = structuredClone(this.state);
				lite.logoSrc = null;
				lite.productLogo = {};
				lite.slots.punggung.extraSrc = null;
				localStorage.setItem(STORE_KEY, JSON.stringify(lite));
			} catch {}
		}
	}

	loadFromLocalStorage() {
		if (typeof window === 'undefined') return;
		try {
			let saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
			if (!saved) {
				saved = JSON.parse(localStorage.getItem(LEGACY_STORE_KEY) || 'null');
				if (saved && typeof saved === 'object') delete saved.look;
			}
			if (saved && typeof saved === 'object') {
				Object.assign(this.state, saved);
			}
		} catch {}
	}
}

export const uniformStore = new UniformStore();

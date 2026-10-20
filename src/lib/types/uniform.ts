export type ProductKey = 'kemeja' | 'kemejaPanjang' | 'kaos' | 'polo' | 'rompi';

export type SleeveType = 'short' | 'long' | 'tee' | 'polo' | 'none';
export type CollarType = 'shirt' | 'crew' | 'polo' | 'stand';
export type PlacketType = 'full' | 'polo' | 'zip' | 'none';
export type FinishType = 'bordir' | 'sablon';
export type WeaveType = 'drill' | 'jersey' | 'mesh' | 'pique' | 'taslan' | 'ripstop';

export interface Material {
	id: string;
	name: string;
	list: number | null;
	promo: number | null;
	weave: WeaveType;
}

export type SizeTuple = [size: string, panjang: number | null, lebar: number | null];

export interface ProductConfig {
	name: string;
	sleeve: SleeveType;
	collar: CollarType;
	placket: PlacketType;
	pockets: boolean;
	cargo?: boolean;
	buttons: boolean;
	finish: FinishType;
	noPrice?: boolean;
	materials: Material[];
	minOrder: number | null;
	includes: string[];
	sizes: SizeTuple[];
	slots: SlotKey[];
	ease: number;
	frontSlotY?: number;
	note?: string;
}

export type SlotKey = 'dadaKiri' | 'dadaKanan' | 'depan' | 'punggung';

export interface SlotDefinition {
	label: string;
	hint: string;
	side: 'front' | 'back';
	s: number;
	y: number;
	logoH: number;
	textH: number;
	maxW: number;
	extraH?: number;
	multi?: boolean;
}

export interface SlotState {
	logo: boolean;
	text: string;
	font: string;
	color: string;
	size: number;
	dy: number;
	extraSrc?: string | null;
}

export interface LookConfig {
	pattern: string;
	body: string;
	accent: string;
	accent2?: string;
	button: string;
	lining?: string;
}

export interface CustomerInfo {
	name: string;
	org: string;
	phone?: string;
	email?: string;
	note: string;
}

export interface UniformState {
	product: ProductKey;
	material: Record<ProductKey, string>;
	look: Record<ProductKey, LookConfig>;
	logoSrc: string | null;
	removeWhite: boolean;
	slotOn: Record<ProductKey, Record<SlotKey, boolean>>;
	slots: Record<SlotKey, SlotState>;
	measureOn: boolean;
	sleeveStyle: 'panjang' | 'gulung';
	pocketCount: Record<ProductKey, number>;
	vestFlag: boolean;
	qty: Record<ProductKey, Record<string, number>>;
	customer: CustomerInfo;
	chest: string;
	weight: string;
	height: string;
}

export interface PatternItem {
	id: string;
	group: 'dasar' | 'sport' | 'logistik' | 'rompi';
	name: string;
	desc: string;
	sleeve?: number;
	trim?: number;
	pocket?: number;
	placket?: number;
	body?: string;
	c3?: boolean;
	sleeveSplit?: boolean;
	sleeveStripe?: 'accent' | 'reflect' | 'double' | 'pipe';
	extra?: boolean;
	catalog?: boolean;
	vestOnly?: boolean;
}

export interface SizeRecommendation {
	byW: { size: string } | null;
	byC: { size: string; lebar: number } | null;
	size: string | null;
	over: boolean;
	tallUp: string | null;
	kg: number;
	cm: number;
	tb: number;
}

export interface DbDesign {
	id?: string;
	slug?: string;
	created_at?: string;
	updated_at?: string;
	product: ProductKey;
	state_data: UniformState;
	preview_front?: string | null;
	preview_back?: string | null;
}

export interface DbOrder {
	id?: string;
	design_id?: string;
	created_at?: string;
	customer_name: string;
	customer_org?: string;
	customer_phone: string;
	customer_email?: string;
	notes?: string;
	total_qty: number;
	total_price: number | null;
	product_name: string;
	material_name: string;
	breakdown: Record<string, number>;
	summary_text: string;
	preview_front?: string | null;
	preview_back?: string | null;
	status: 'pending' | 'dikonfirmasi' | 'diproses' | 'selesai' | 'dibatalkan';
}

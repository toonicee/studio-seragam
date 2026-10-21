import type {
	OrderStatus,
	PoStatus,
	ProductImage,
	RefundReason,
	RefundStatus,
	SizeRow
} from './constants';

export type { OrderStatus, PoStatus, ProductImage, RefundReason, RefundStatus, SizeRow };

/** Data PO yang dikirim ke halaman (tanggal dalam milidetik) */
export interface BatchView {
	id: number;
	batchNo: number;
	target: number;
	/** Pcs dari pesanan yang sudah dikonfirmasi lunas */
	collected: number;
	closesAt: number;
	productionDays: number;
	status: PoStatus;
}

export interface CategoryView {
	id: number;
	slug: string;
	name: string;
	description: string;
	count: number;
	image: ProductImage | null;
}

export interface ProductCardView {
	id: number;
	slug: string;
	name: string;
	summary: string;
	price: number;
	sizes: string[];
	images: ProductImage[];
	category: { slug: string; name: string };
	batch: BatchView | null;
	createdAt: number;
}

export interface ProductDetailView extends ProductCardView {
	description: string;
	details: string;
	sizeChart: SizeRow[];
	productionDays: number;
}

/** Alasan item keranjang tidak bisa dipesan; teksnya di i18n `cart.problem.*` */
export type CartProblem = 'inactive' | 'no_po' | 'closed' | 'size';

export interface CartLineView {
	key: string;
	productId: number;
	slug: string;
	name: string;
	image: ProductImage | null;
	price: number;
	size: string | null;
	qty: number;
	lineTotal: number;
	batch: BatchView | null;
	orderable: boolean;
	problem: CartProblem | null;
}

export interface CartView {
	lines: CartLineView[];
	count: number;
	subtotal: number;
	ready: boolean;
}

export interface OrderItemView {
	id: number;
	productId: number;
	productSlug: string | null;
	productName: string;
	image: ProductImage | null;
	unitPrice: number;
	size: string | null;
	qty: number;
	batch: BatchView;
	refunded: boolean;
}

export interface RefundView {
	id: number;
	amount: number;
	reason: RefundReason;
	status: RefundStatus;
	destination: string;
	note: string;
	createdAt: number;
	doneAt: number | null;
}

export interface OrderView {
	id: number;
	code: string;
	token: string;
	partnerCode: string;
	customerName: string;
	phone: string;
	email: string | null;
	address: string;
	city: string;
	postalCode: string;
	note: string;
	shippingZone: string;
	shippingFee: number;
	subtotal: number;
	uniqueCode: number;
	total: number;
	status: OrderStatus;
	payBy: number;
	hasProof: boolean;
	proofAt: number | null;
	rejectReason: string | null;
	paidAt: number | null;
	trackingNo: string | null;
	shippedAt: number | null;
	cancelledAt: number | null;
	cancelReason: string | null;
	createdAt: number;
	items: OrderItemView[];
	refunds: RefundView[];
}

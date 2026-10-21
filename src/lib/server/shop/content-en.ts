/** Isi versi English untuk katalog contoh & halaman info. Dipakai saat seed dan untuk mengisi database lama. */

export const CATEGORY_EN: Record<string, { name: string; description: string }> = {
	pakaian: { name: 'Apparel', description: 'Official Indah Expres T-shirts, shirts, polos, and vests.' },
	'topi-aksesoris': { name: 'Caps & Accessories', description: 'Uniform extras and souvenirs for the team.' },
	tas: { name: 'Bags', description: 'Indah Expres canvas bags for work and everyday use.' },
	'rumah-kantor': { name: 'Home & Office', description: 'Drinkware for the office, warehouse, and home.' }
};

export const PRODUCT_EN: Record<string, { name: string; summary: string; description: string; details: string[] }> = {
	'kaos-indah-expres': {
		name: 'Indah Expres T-Shirt',
		summary: 'White Dri-Fit T-shirt with an orange logo print.',
		description:
			'The official Indah Expres T-shirt in white with an orange logo print on the chest and back. Lightweight Dri-Fit fabric that dries fast and stays cool in the field. The DTF print stays sharp wash after wash.',
		details: ['Dri-Fit 2720 fabric', 'DTF print on front and back', 'Regular unisex fit', 'White with orange print', 'Wash cold, do not iron over the print']
	},
	'kemeja-lengan-pendek': {
		name: 'Short-Sleeve Shirt',
		summary: 'White shirt with orange accents and an embroidered logo.',
		description:
			'A white work shirt with orange accents on the collar, placket, cuffs, and pocket flaps. Unione American drill fabric: sturdy, wrinkle-resistant, and neat all day. The logo is embroidered on the chest.',
		details: [
			'Unione American fabric (drill)',
			'Embroidered logo on left chest and back',
			'2 patch pockets with flaps',
			'Orange accents on collar, placket, cuffs, and pockets',
			'Buttons match the accent colour'
		]
	},
	'kemeja-lengan-panjang': {
		name: 'Long-Sleeve Shirt',
		summary: 'Executive shirt with buttoned cuffs.',
		description:
			'The long-sleeve version for meetings and formal events. The buttoned cuffs can be rolled up for field work. Made from the same sturdy Unione American fabric as the short-sleeve shirt.',
		details: ['Unione American fabric (drill)', 'Buttoned cuffs that roll up', 'Embroidered logo on left chest and back', 'Orange accents on collar and cuffs']
	},
	'kaos-polo': {
		name: 'Polo Shirt',
		summary: 'White piqué polo with orange buttons.',
		description:
			"Smart without a full shirt. Breathable piqué knit that's comfortable all day at the counter or in the warehouse. The logo is embroidered on the left chest and back.",
		details: ['Lacoste piqué fabric', 'Embroidered logo on left chest and back', 'White with orange buttons']
	},
	'rompi-lapangan': {
		name: 'Field Vest',
		summary: 'Orange vest with reflective strips for road teams.',
		description:
			'A lightweight orange vest for drivers and field teams. Smooth, splash-resistant taslan fabric with reflective strips so you stay visible on the road at night.',
		details: ['Splash-resistant taslan fabric', 'Reflective strips on the chest', 'Front zip and 2 cargo pockets', 'Embroidered logo on chest and back']
	},
	'topi-indah-expres': {
		name: 'Indah Expres Cap',
		summary: 'Twill baseball cap with an embroidered front logo.',
		description:
			'A thick twill baseball cap with the Indah Expres logo embroidered on the front. The adjustable back strap fits all head sizes.',
		details: ['Cotton twill', 'Embroidered front logo', 'Adjustable back strap', 'One size']
	},
	'gantungan-kunci': {
		name: 'Keychain',
		summary: 'Acrylic keychain shaped like the Indah Expres logo.',
		description:
			'A clear acrylic keychain with the Indah Expres logo printed on both sides. Light and perfect for motorbike keys or bags.',
		details: ['3 mm acrylic', 'Double-sided UV print', 'Rust-resistant metal ring']
	},
	'tote-bag-kanvas': {
		name: 'Canvas Tote Bag',
		summary: '12 oz canvas tote that fits a 14-inch laptop.',
		description:
			'A heavy canvas tote bag with the Indah Expres logo print. Fits a 14-inch laptop and documents — great for work or shopping.',
		details: ['12 oz canvas', 'One-sided logo print', 'Size 38 × 42 cm', '60 cm shoulder straps']
	},
	'tumbler-500ml': {
		name: '500 ml Tumbler',
		summary: 'Double-wall stainless tumbler with an engraved logo.',
		description:
			'A double-wall stainless steel tumbler that keeps drinks cold for up to 12 hours or hot for up to 6 hours. The Indah Expres logo is laser-engraved so it never fades.',
		details: ['Double-wall 304 stainless steel', '500 ml capacity', 'Laser-engraved logo', 'Spill-proof lid']
	},
	'mug-keramik': {
		name: 'Ceramic Mug',
		summary: 'White 350 ml ceramic mug with an orange logo.',
		description:
			'A white 350 ml ceramic mug printed with the orange Indah Expres logo. Microwave and dishwasher safe.',
		details: ['350 ml ceramic', 'Sublimation logo print', 'Microwave safe']
	}
};

export const PAGE_EN: Record<string, { title: string; body: string }> = {
	'cara-kerja-po': {
		title: 'How Pre-order Works',
		body: `All Indah Expres merchandise is sold as a **pre-order**. A product is only made if enough orders come in before the pre-order closes.

## The steps

1. **Order & pay.** Choose a product and size, enter your partner code, then pay in full with QRIS for the exact amount (it includes a unique code). Upload your payment proof on the order page.
2. **Payment confirmed.** The admin matches your payment in GoPay Merchant. Once it is marked paid, your order counts toward the pre-order.
3. **Target reached.** The pre-order stays open until its closing date at 23:59 WIB, even after the target is reached.
4. **Production & delivery.** If the target is reached, the product is made and shipped via Indah Expres. The tracking number appears on your order page.

## If the target isn't reached

All orders for that product are cancelled and refunded **100%**, including the unique code. The admin contacts you on WhatsApp to ask where to send the refund.

## Good to know

- Orders that aren't paid by the payment deadline are cancelled automatically.
- Payments that haven't been confirmed when the pre-order closes are cancelled too, so pay and upload your proof as soon as you can.
- Sizes can't be exchanged after the pre-order closes. Check the size chart before ordering.`
	},
	faq: {
		title: 'FAQ',
		body: `## Who can buy?

This shop is for Indah Expres partners only. At checkout you need your partner code and your registered WhatsApp number. Don't have a partner code yet? Contact the admin on WhatsApp.

## What is a pre-order?

Products are made after orders are collected. Each product has a quantity target and a closing date. If the target is reached, the product is made; if not, you get a 100% refund.

## When will my order ship?

The estimated shipping date is shown on each product page: the closing date plus the production time. Orders with several products ship together once everything is made.

## Why does the amount include a unique code?

A unique code of Rp1–999 gives every order a different amount, so the admin can recognise your payment in the QRIS history. Pay the exact amount shown.

## How do I pay?

Scan the QRIS code on your order page with any e-wallet or mobile banking app, enter the exact amount, then upload a screenshot of the payment proof.

## How long does payment confirmation take?

The admin checks payments every day. Your order status changes to **Paid** once it's confirmed.

## Can I cancel my order?

Yes, while the pre-order is still open: contact the admin on WhatsApp and you'll get a full refund. After the pre-order closes, orders can't be cancelled.

## Can I exchange sizes?

Not after the pre-order closes, because products are made to order. Check the size chart on the product page before ordering.

## I lost my order link

Open **Track order**, then enter your order number and WhatsApp number.`
	},
	'kebijakan-refund': {
		title: 'Refund Policy',
		body: `You get a **100%** refund if:

- the pre-order doesn't reach its target when it closes;
- you cancel your order while the pre-order is still open;
- your payment hasn't been confirmed by the time the pre-order closes.

## How refunds work

1. The admin contacts you on WhatsApp and asks where to send the refund: GoPay or a bank account.
2. The admin transfers the money and marks your order as **Refunded**.
3. You can see the refund status on your order page.

Refunds are handled manually because payments use a static QRIS code. Shipping is refunded if the whole order is cancelled. If only some products fail, the price of those products is refunded.`
	},
	kontak: {
		title: 'Contact',
		body: 'Questions about your order, partner code, or a refund? Contact the Indah Expres Shop admin on WhatsApp and include your order number so we can help you quickly.'
	}
};

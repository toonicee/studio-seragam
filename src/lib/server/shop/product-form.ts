/** Konversi produk ⇄ isian form admin */
import type { Product } from '../db/schema';
import { sizeChartToText } from './admin';

export const productToForm = (p: Product) => ({
	name: p.name,
	slug: p.slug,
	categoryId: p.categoryId,
	summary: p.summary,
	description: p.description,
	details: p.details,
	nameEn: p.nameEn,
	summaryEn: p.summaryEn,
	descriptionEn: p.descriptionEn,
	detailsEn: p.detailsEn,
	price: p.price,
	sizes: p.sizes.join(', '),
	sizeChart: sizeChartToText(p.sizeChart),
	productionDays: p.productionDays,
	active: p.active,
	featured: p.featured,
	sort: p.sort
});

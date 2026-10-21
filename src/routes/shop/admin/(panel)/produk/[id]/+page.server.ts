import { error, fail } from '@sveltejs/kit';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { getDb } from '$lib/server/db';
import { getProductAdmin, listCategoriesAdmin, saveProduct, setProductImages } from '$lib/server/shop/admin';
import { listBatchesForProduct, openBatch, updateOpenBatch } from '$lib/server/shop/batches';
import { requireAdmin } from '$lib/server/shop/guard';
import { ShopError } from '$lib/server/shop/orders';
import { productToForm } from '$lib/server/shop/product-form';
import { mediaUrl, saveImage } from '$lib/server/shop/uploads';
import { addDays, wibDateString, wibDeadline } from '$lib/shop/po';
import { batchSchema, productSchema } from '$lib/shop/schemas';
import type { Actions, PageServerLoad } from './$types';

function loadProduct(id: string) {
	const p = getProductAdmin(getDb(), Number(id));
	if (!p) error(404, 'Produk tidak ditemukan');
	return p;
}

export const load: PageServerLoad = async ({ params }) => {
	const db = getDb();
	const p = loadProduct(params.id);
	const batches = listBatchesForProduct(db, p.id);
	const open = batches.find((b) => b.status === 'open') ?? null;
	const today = wibDateString(Date.now());
	const batchForm = await superValidate(
		open
			? { target: open.target, closeDate: wibDateString(open.closesAt), productionDays: open.productionDays }
			: { target: batches[0]?.target ?? 30, closeDate: addDays(today, 14), productionDays: p.productionDays },
		zod4(batchSchema),
		{ id: 'batch', errors: false }
	);
	return {
		product: { id: p.id, slug: p.slug, name: p.name, images: p.images, active: p.active },
		form: await superValidate(productToForm(p), zod4(productSchema), { id: 'product', errors: false }),
		batchForm,
		batches,
		openBatchId: open?.id ?? null,
		categories: listCategoriesAdmin(db)
	};
};

export const actions: Actions = {
	save: async ({ request, params, locals }) => {
		requireAdmin(locals);
		const form = await superValidate(request, zod4(productSchema), { id: 'product' });
		if (!form.valid) return fail(400, { form });
		try {
			saveProduct(getDb(), Number(params.id), form.data, new Date());
		} catch (e) {
			if (e instanceof ShopError && e.field === 'slug') return setError(form, 'slug', e.message);
			throw e;
		}
		return message(form, 'Produk disimpan');
	},

	batch: async ({ request, params, locals }) => {
		requireAdmin(locals);
		const form = await superValidate(request, zod4(batchSchema), { id: 'batch' });
		if (!form.valid) return fail(400, { form });
		const db = getDb();
		const p = loadProduct(params.id);
		const input = { target: form.data.target, closesAt: wibDeadline(form.data.closeDate), productionDays: form.data.productionDays };
		const open = listBatchesForProduct(db, p.id).find((b) => b.status === 'open');
		try {
			if (open) updateOpenBatch(db, open.id, input, new Date());
			else openBatch(db, p.id, input, new Date());
		} catch (e) {
			if (e instanceof ShopError) {
				if (e.field === 'closeDate') return setError(form, 'closeDate', e.message);
				return message(form, e.message, { status: 400 });
			}
			throw e;
		}
		return message(form, open ? 'PO diperbarui' : 'PO baru dibuka');
	},

	upload: async ({ request, params, locals }) => {
		requireAdmin(locals);
		const p = loadProduct(params.id);
		const files = (await request.formData()).getAll('images').filter((f): f is File => f instanceof File && f.size > 0);
		if (!files.length) return fail(400, { imageMessage: 'Pilih foto terlebih dahulu.' });
		try {
			const added = [];
			for (const f of files.slice(0, 8)) {
				const rel = await saveImage(f, 'products', { maxSize: 1600, prefix: p.slug });
				added.push({ src: mediaUrl(rel), alt: p.name });
			}
			// Foto asli menggantikan gambar sementara
			setProductImages(getDb(), p.id, [...p.images.filter((i) => !i.placeholder), ...added], new Date());
		} catch (e) {
			if (e instanceof ShopError) return fail(400, { imageMessage: e.message });
			throw e;
		}
		return { imageMessage: `${files.length} foto ditambahkan` };
	},

	image: async ({ request, params, locals }) => {
		requireAdmin(locals);
		const p = loadProduct(params.id);
		const fd = await request.formData();
		const i = Number(fd.get('index'));
		const op = String(fd.get('op'));
		const images = [...p.images];
		if (!Number.isInteger(i) || i < 0 || i >= images.length) return fail(400, { imageMessage: 'Foto tidak ditemukan.' });
		if (op === 'remove') images.splice(i, 1);
		else if (op === 'left' && i > 0) [images[i - 1], images[i]] = [images[i], images[i - 1]];
		else if (op === 'right' && i < images.length - 1) [images[i + 1], images[i]] = [images[i], images[i + 1]];
		setProductImages(getDb(), p.id, images, new Date());
		return { imageMessage: op === 'remove' ? 'Foto dihapus' : 'Urutan foto diubah' };
	}
};

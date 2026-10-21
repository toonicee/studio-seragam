import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { getDb } from '$lib/server/db';
import { partners } from '$lib/server/db/schema';
import { listPartners, parseCsv, savePartner } from '$lib/server/shop/admin';
import { requireAdmin } from '$lib/server/shop/guard';
import { ShopError } from '$lib/server/shop/orders';
import { normalizePhone } from '$lib/shop/format';
import { partnerSchema } from '$lib/shop/schemas';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	rows: listPartners(getDb()),
	form: await superValidate({ id: 0, active: true }, zod4(partnerSchema), { errors: false })
});

export const actions: Actions = {
	save: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await superValidate(request, zod4(partnerSchema));
		if (!form.valid) return fail(400, { form });
		try {
			savePartner(getDb(), { ...form.data, phone: normalizePhone(form.data.phone)! }, new Date());
		} catch (e) {
			if (e instanceof ShopError && e.field === 'code') return setError(form, 'code', e.message);
			throw e;
		}
		return message(form, form.data.id ? 'Data mitra diperbarui' : 'Mitra ditambahkan');
	},

	toggle: async ({ request, locals }) => {
		requireAdmin(locals);
		const fd = await request.formData();
		const id = Number(fd.get('id'));
		const active = fd.get('active') === '1';
		getDb().update(partners).set({ active, updatedAt: new Date() }).where(eq(partners.id, id)).run();
		return { toast: active ? 'Mitra diaktifkan' : 'Mitra dinonaktifkan' };
	},

	import: async ({ request, locals }) => {
		requireAdmin(locals);
		const file = (await request.formData()).get('csv');
		if (!(file instanceof File) || !file.size) return fail(400, { importError: 'Pilih file CSV.' });
		if (file.size > 2_000_000) return fail(400, { importError: 'File terlalu besar (maks. 2 MB).' });
		const rows = parseCsv(await file.text());
		if (rows.length && /nama|kode|whatsapp|phone/i.test(rows[0].join(' '))) rows.shift();
		const db = getDb();
		const now = new Date();
		let added = 0;
		let updated = 0;
		const skipped: string[] = [];
		db.transaction((tx) => {
			rows.forEach((r, i) => {
				const [name = '', code = '', wa = '', city = ''] = r;
				const phone = normalizePhone(wa);
				const cleanCode = code.trim().toUpperCase();
				if (name.trim().length < 2 || !/^[A-Z0-9-]{2,32}$/.test(cleanCode) || !phone) {
					skipped.push(`baris ${i + 2}`);
					return;
				}
				const existing = tx.select({ id: partners.id }).from(partners).where(eq(partners.code, cleanCode)).get();
				savePartner(tx, { id: existing?.id ?? 0, code: cleanCode, name: name.trim(), phone, city: city.trim(), active: true }, now);
				if (existing) updated++;
				else added++;
			});
		});
		return { imported: { added, updated, skipped } };
	}
};

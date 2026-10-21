import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { APIError } from 'better-auth/api';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { getAuth } from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import { pages, shippingZones } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/shop/guard';
import { ShopError } from '$lib/server/shop/orders';
import { getSettings, listPages, listZones, setSettings } from '$lib/server/shop/settings';
import { mediaUrl, saveImage } from '$lib/server/shop/uploads';
import { fmtPhone, normalizePhone } from '$lib/shop/format';
import { INFO_PAGES } from '$lib/shop/constants';
import { pageSchema, passwordSchema, settingsSchema, zoneSchema } from '$lib/shop/schemas';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const db = getDb();
	const s = getSettings(db);
	const stored = new Map(listPages(db).map((p) => [p.slug, p]));
	return {
		qrisUrl: s.qrisImage ? mediaUrl(s.qrisImage) : null,
		settingsForm: await superValidate(
			{ merchantName: s.merchantName, waAdmin: fmtPhone(s.waAdmin), payWindowHours: s.payWindowHours },
			zod4(settingsSchema),
			{ id: 'settings', errors: false }
		),
		passwordForm: await superValidate(zod4(passwordSchema), { id: 'password' }),
		zones: listZones(db, true),
		pages: INFO_PAGES.map((p) => {
			const row = stored.get(p.slug);
			return { slug: p.slug, title: row?.title ?? p.title, body: row?.body ?? '', titleEn: row?.titleEn ?? '', bodyEn: row?.bodyEn ?? '' };
		}),
		placeholderWa: s.waAdmin === '6281200000000'
	};
};

const intOf = (v: FormDataEntryValue | null) => Number(String(v ?? '').replace(/\D/g, ''));

export const actions: Actions = {
	settings: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await superValidate(request, zod4(settingsSchema), { id: 'settings' });
		if (!form.valid) return fail(400, { form });
		setSettings(getDb(), {
			merchantName: form.data.merchantName,
			waAdmin: normalizePhone(form.data.waAdmin)!,
			payWindowHours: form.data.payWindowHours
		});
		return message(form, 'Pengaturan disimpan');
	},

	qris: async ({ request, locals }) => {
		requireAdmin(locals);
		try {
			const rel = await saveImage((await request.formData()).get('qris'), 'qris', { maxSize: 1400, prefix: 'qris' });
			setSettings(getDb(), { qrisImage: rel });
		} catch (e) {
			if (e instanceof ShopError) return fail(400, { message: e.message });
			throw e;
		}
		return { ok: 'Gambar QRIS diperbarui' };
	},

	zone: async ({ request, locals }) => {
		requireAdmin(locals);
		const fd = await request.formData();
		const parsed = zoneSchema.safeParse({
			id: Number(fd.get('id') ?? 0),
			name: String(fd.get('name') ?? ''),
			fee: intOf(fd.get('fee')),
			active: fd.get('active') === 'on'
		});
		if (!parsed.success) return fail(400, { message: parsed.error.issues[0]?.message ?? 'Data tarif tidak valid' });
		const db = getDb();
		const { id, ...values } = parsed.data;
		if (id) db.update(shippingZones).set(values).where(eq(shippingZones.id, id)).run();
		else db.insert(shippingZones).values({ ...values, sort: listZones(db, true).length }).run();
		return { ok: id ? 'Tarif ongkir diperbarui' : 'Tarif ongkir ditambahkan' };
	},

	page: async ({ request, locals }) => {
		requireAdmin(locals);
		const fd = await request.formData();
		const parsed = pageSchema.safeParse({
			slug: fd.get('slug'),
			title: fd.get('title'),
			body: fd.get('body'),
			titleEn: fd.get('titleEn') ?? '',
			bodyEn: fd.get('bodyEn') ?? ''
		});
		if (!parsed.success) return fail(400, { message: parsed.error.issues[0]?.message ?? 'Isi halaman tidak valid' });
		const { slug, title, body, titleEn, bodyEn } = parsed.data;
		getDb()
			.insert(pages)
			.values({ slug, title, body, titleEn, bodyEn, updatedAt: new Date() })
			.onConflictDoUpdate({ target: pages.slug, set: { title, body, titleEn, bodyEn, updatedAt: new Date() } })
			.run();
		return { ok: `Halaman "${title}" disimpan` };
	},

	password: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await superValidate(request, zod4(passwordSchema), { id: 'password' });
		if (!form.valid) return fail(400, { form });
		try {
			await getAuth().api.changePassword({
				body: { currentPassword: form.data.currentPassword, newPassword: form.data.newPassword, revokeOtherSessions: true },
				headers: request.headers
			});
		} catch (e) {
			if (e instanceof APIError) return setError(form, 'currentPassword', 'Kata sandi sekarang salah.');
			throw e;
		}
		return message(form, 'Kata sandi diganti');
	}
};

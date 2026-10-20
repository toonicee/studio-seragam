import { supabase, isSupabaseConfigured } from './client';
import type { UniformState, DbDesign, DbOrder } from '$lib/types/uniform';

function generateRandomSlug(len = 7): string {
	const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
	let res = '';
	for (let i = 0; i < len; i++) {
		res += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return res;
}

/**
 * Upload Base64 image to Supabase Storage bucket
 */
export async function uploadBase64Image(
	bucket: 'logos' | 'mockups',
	fileName: string,
	base64Data: string
): Promise<string | null> {
	if (!supabase || !isSupabaseConfigured) return null;
	try {
		const match = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
		const mimeType = match ? match[1] : 'image/png';
		const blob = await (await fetch(base64Data)).blob();
		const filePath = `${Date.now()}-${fileName}`;

		const { error: uploadError } = await supabase.storage
			.from(bucket)
			.upload(filePath, blob, { contentType: mimeType, upsert: true });

		if (uploadError) {
			console.warn('Storage upload error:', uploadError.message);
			return null;
		}

		const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
		return data.publicUrl;
	} catch (err) {
		console.warn('Failed to upload image to Supabase Storage:', err);
		return null;
	}
}

/**
 * Simpan desain ke database Supabase
 */
export async function saveDesignToDb(
	state: UniformState,
	previewFront?: string | null,
	previewBack?: string | null
): Promise<{ success: boolean; id?: string; slug?: string; error?: string }> {
	const slug = generateRandomSlug();

	if (!supabase || !isSupabaseConfigured) {
		// Fallback ke penyimpanan lokal jika Supabase belum dihubungkan
		try {
			const localDesigns = JSON.parse(localStorage.getItem('studio-seragam:saved-designs') || '[]');
			const newEntry = {
				id: 'local-' + Date.now(),
				slug,
				product: state.product,
				state_data: state,
				preview_front: previewFront,
				preview_back: previewBack,
				created_at: new Date().toISOString()
			};
			localDesigns.unshift(newEntry);
			localStorage.setItem('studio-seragam:saved-designs', JSON.stringify(localDesigns.slice(0, 20)));
			return { success: true, id: newEntry.id, slug };
		} catch (e: any) {
			return { success: false, error: e?.message || 'Gagal menyimpan ke penyimpanan lokal' };
		}
	}

	try {
		// Simpan gambar mockup ke Storage jika ada
		let frontUrl = previewFront;
		let backUrl = previewBack;

		if (previewFront?.startsWith('data:image')) {
			const uploaded = await uploadBase64Image('mockups', `${slug}-front.png`, previewFront);
			if (uploaded) frontUrl = uploaded;
		}

		if (previewBack?.startsWith('data:image')) {
			const uploaded = await uploadBase64Image('mockups', `${slug}-back.png`, previewBack);
			if (uploaded) backUrl = uploaded;
		}

		const payload: Partial<DbDesign> = {
			slug,
			product: state.product,
			state_data: state,
			preview_front: frontUrl,
			preview_back: backUrl
		};

		const { data, error } = await supabase
			.from('designs')
			.insert(payload)
			.select('id, slug')
			.single();

		if (error) {
			console.error('Error saving design to Supabase:', error);
			return { success: false, error: error.message };
		}

		return { success: true, id: data.id, slug: data.slug };
	} catch (err: any) {
		console.error('Exception saving design:', err);
		return { success: false, error: err?.message || 'Terjadi kesalahan sistem' };
	}
}

/**
 * Muat desain tersimpan dari Supabase atau localStorage
 */
export async function loadDesignFromDb(idOrSlug: string): Promise<DbDesign | null> {
	if (idOrSlug.startsWith('local-')) {
		try {
			const localDesigns: DbDesign[] = JSON.parse(
				localStorage.getItem('studio-seragam:saved-designs') || '[]'
			);
			return localDesigns.find(d => d.id === idOrSlug || d.slug === idOrSlug) || null;
		} catch {
			return null;
		}
	}

	if (!supabase || !isSupabaseConfigured) return null;

	try {
		const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
		const query = supabase.from('designs').select('*');

		if (isUuid) {
			query.eq('id', idOrSlug);
		} else {
			query.eq('slug', idOrSlug);
		}

		const { data, error } = await query.single();
		if (error || !data) {
			console.warn('Design not found:', error?.message);
			return null;
		}

		return data as DbDesign;
	} catch (err) {
		console.error('Exception loading design:', err);
		return null;
	}
}

/**
 * Buat pesanan baru di Supabase Database
 */
export async function submitOrderToDb(
	order: Omit<DbOrder, 'id' | 'created_at' | 'status'>
): Promise<{ success: boolean; id?: string; error?: string }> {
	const newOrder: DbOrder = {
		...order,
		status: 'pending'
	};

	if (!supabase || !isSupabaseConfigured) {
		// Simpan secara lokal jika DB Supabase belum di-setup
		try {
			const localOrders = JSON.parse(localStorage.getItem('studio-seragam:orders') || '[]');
			const entry: DbOrder = {
				...newOrder,
				id: 'order-' + Date.now(),
				created_at: new Date().toISOString()
			};
			localOrders.unshift(entry);
			localStorage.setItem('studio-seragam:orders', JSON.stringify(localOrders.slice(0, 30)));
			return { success: true, id: entry.id };
		} catch (e: any) {
			return { success: false, error: e?.message || 'Gagal menyimpan pesanan lokal' };
		}
	}

	try {
		const { data, error } = await supabase.from('orders').insert(newOrder).select('id').single();

		if (error) {
			console.error('Error inserting order into Supabase:', error);
			return { success: false, error: error.message };
		}

		// Tambahkan juga ke cache lokal untuk riwayat pengguna
		try {
			const localOrders = JSON.parse(localStorage.getItem('studio-seragam:orders') || '[]');
			localOrders.unshift({ ...newOrder, id: data.id, created_at: new Date().toISOString() });
			localStorage.setItem('studio-seragam:orders', JSON.stringify(localOrders.slice(0, 30)));
		} catch {}

		return { success: true, id: data.id };
	} catch (err: any) {
		return { success: false, error: err?.message || 'Gagal mengirim order' };
	}
}

/**
 * Ambil daftar order yang tersimpan (untuk modal daftar order)
 */
export async function fetchRecentOrders(): Promise<DbOrder[]> {
	if (supabase && isSupabaseConfigured) {
		try {
			const { data, error } = await supabase
				.from('orders')
				.select('*')
				.order('created_at', { ascending: false })
				.limit(20);

			if (!error && data) return data as DbOrder[];
		} catch (err) {
			console.warn('Failed to fetch from supabase orders:', err);
		}
	}

	try {
		return JSON.parse(localStorage.getItem('studio-seragam:orders') || '[]');
	} catch {
		return [];
	}
}

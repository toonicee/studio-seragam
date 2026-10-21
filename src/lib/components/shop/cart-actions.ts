import { invalidateAll } from '$app/navigation';
import type { SubmitFunction } from '$app/forms';
import { toast } from 'svelte-sonner';

/** Form ubah jumlah / hapus barang di keranjang (sheet & halaman keranjang) */
export const cartAction: SubmitFunction = () => {
	return async ({ result }) => {
		if (result.type === 'failure') toast.error(String(result.data?.message ?? 'Keranjang gagal diperbarui'));
		if (result.type === 'error') toast.error('Keranjang gagal diperbarui. Coba lagi.');
		await invalidateAll();
	};
};

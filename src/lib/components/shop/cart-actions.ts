import { invalidateAll } from '$app/navigation';
import type { SubmitFunction } from '$app/forms';
import { toast } from 'svelte-sonner';
import { t } from '$lib/shop/i18n.svelte';

/** Form ubah jumlah / hapus barang di keranjang (sheet & halaman keranjang) */
export const cartAction: SubmitFunction = () => {
	return async ({ result }) => {
		if (result.type === 'failure') toast.error(String(result.data?.message ?? t('cart.updateFailed')));
		if (result.type === 'error') toast.error(t('cart.updateFailed'));
		await invalidateAll();
	};
};

<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import ProductForm from '$lib/components/admin/ProductForm.svelte';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	// svelte-ignore state_referenced_locally
	const sf = superForm(data.form);
</script>

<svelte:head><title>Tambah produk — Admin Toko Indah Expres</title></svelte:head>

<a href="/shop/admin/produk" class="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft class="size-4" /> Produk</a>
<PageHeader title="Tambah produk" description="Setelah disimpan, unggah foto lalu buka PO pertama." />
<ProductForm {sf} categories={data.categories} isNew />

<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import Copy from '@lucide/svelte/icons/copy';
	import QrCode from '@lucide/svelte/icons/qr-code';
	import Upload from '@lucide/svelte/icons/upload';
	import ImageIcon from '@lucide/svelte/icons/image';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import { fmtDateTime, rupiah } from '$lib/shop/format';
	import { lang, t } from '$lib/shop/i18n.svelte';
	import type { OrderView } from '$lib/shop/types';
	import Countdown from './Countdown.svelte';

	let {
		order,
		qrisUrl,
		merchantName,
		now
	}: { order: OrderView; qrisUrl: string | null; merchantName: string; now: number } = $props();

	let preview = $state<string | null>(null);
	let uploading = $state(false);

	async function copyAmount() {
		try {
			await navigator.clipboard.writeText(String(order.total));
			toast.success(t('pay.copied'));
		} catch {
			toast.error(t('pay.copyManual', { n: order.total }));
		}
	}

	function onFile(e: Event) {
		const file = (e.currentTarget as HTMLInputElement).files?.[0];
		if (preview) URL.revokeObjectURL(preview);
		preview = file ? URL.createObjectURL(file) : null;
	}
</script>

<section class="overflow-hidden rounded-lg border-2 border-brand" aria-labelledby="bayar-judul">
	<div class="bg-brand px-5 py-3 text-white">
		<h2 id="bayar-judul" class="font-display text-2xl font-bold uppercase">{t('pay.title')}</h2>
		<p class="text-sm text-white/85">
			{t('pay.before', { at: fmtDateTime(order.payBy, lang()) })} (<Countdown until={order.payBy} {now} />)
		</p>
	</div>

	<div class="grid gap-6 p-5 md:grid-cols-[240px_1fr] md:p-6">
		<div class="text-center">
			{#if qrisUrl}
				<img src={qrisUrl} alt="QRIS {merchantName}" width="240" height="240" class="mx-auto w-full max-w-[240px] rounded-md border bg-white object-contain" />
			{:else}
				<div class="mx-auto grid aspect-square w-full max-w-[240px] place-content-center justify-items-center gap-2 rounded-md border-2 border-dashed bg-muted/40 p-4 text-sm text-muted-foreground">
					<QrCode class="size-12" />
					{t('pay.noQris')}
				</div>
			{/if}
			<p class="mt-2 text-sm font-semibold">{merchantName}</p>
			<p class="text-xs text-muted-foreground">{t('pay.merchantType')}</p>
		</div>

		<div>
			<p class="text-sm text-muted-foreground">{t('pay.amountLabel')}</p>
			<div class="mt-1 flex flex-wrap items-center gap-3">
				<p class="font-display text-5xl font-bold tracking-tight text-brand tabular-nums" data-testid="pay-amount">{rupiah(order.total)}</p>
				<Button variant="outline" size="sm" onclick={copyAmount}><Copy class="size-4" /> {t('common.copy')}</Button>
			</div>
			<dl class="mt-3 grid max-w-xs gap-1 text-sm">
				<div class="flex justify-between"><dt class="text-muted-foreground">{t('common.subtotal')}</dt><dd class="tabular-nums">{rupiah(order.subtotal)}</dd></div>
				<div class="flex justify-between"><dt class="text-muted-foreground">{t('common.shipping')}</dt><dd class="tabular-nums">{rupiah(order.shippingFee)}</dd></div>
				<div class="flex justify-between"><dt class="text-muted-foreground">{t('common.uniqueCode')}</dt><dd class="font-semibold text-brand tabular-nums">{rupiah(order.uniqueCode)}</dd></div>
			</dl>
			<ol class="mt-4 list-decimal space-y-1 pl-5 text-sm text-ink-soft marker:font-semibold marker:text-brand">
				<li>{t('pay.step1')}</li>
				<li>{t('pay.step2', { amount: rupiah(order.total) })}</li>
				<li>{t('pay.step3')}</li>
			</ol>
		</div>
	</div>

	<form
		method="POST"
		action="?/proof"
		enctype="multipart/form-data"
		class="border-t bg-muted/30 p-5 md:p-6"
		use:enhance={() => {
			uploading = true;
			return async ({ result, update }) => {
				uploading = false;
				if (result.type === 'success') {
					toast.success(t('pay.uploaded'));
					preview = null;
				} else if (result.type === 'failure') toast.error(String(result.data?.message ?? t('pay.uploadFailed')));
				await update();
			};
		}}
	>
		{#if order.rejectReason}
			<p class="mb-4 flex gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
				<CircleAlert class="mt-0.5 size-4 shrink-0" />
				<span><b>{t('pay.rejected')}</b> {order.rejectReason}</span>
			</p>
		{/if}
		<label for="proof" class="font-semibold">{t('pay.upload')}</label>
		<div class="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
			<label class="flex flex-1 cursor-pointer items-center gap-3 rounded-md border border-dashed bg-white p-3 hover:border-brand">
				{#if preview}
					<img src={preview} alt={t('pay.preview')} class="size-14 rounded object-cover" />
				{:else}
					<span class="grid size-14 place-items-center rounded bg-muted"><ImageIcon class="size-6 text-muted-foreground" /></span>
				{/if}
				<span class="text-sm">
					<span class="font-medium">{preview ? t('pay.change') : t('pay.choose')}</span>
					<span class="block text-xs text-muted-foreground">{t('pay.formats')}</span>
				</span>
				<input id="proof" name="proof" type="file" accept="image/*" required class="sr-only" onchange={onFile} />
			</label>
			<Button type="submit" size="lg" class="h-12 font-semibold" disabled={uploading}>
				<Upload class="size-4" />{uploading ? t('pay.uploading') : t('pay.send')}
			</Button>
		</div>
	</form>
</section>

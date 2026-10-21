<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import WaButton from '$lib/components/shop/WaButton.svelte';
	import Check from '@lucide/svelte/icons/check';
	import X from '@lucide/svelte/icons/x';
	import PartyPopper from '@lucide/svelte/icons/party-popper';
	import { fmtDateTime, fmtDeadline, fmtPhone, rupiah } from '$lib/shop/format';
	import { waText } from '$lib/shop/wa';
	import type { SubmitFunction } from '$app/forms';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let rejecting = $state<number | null>(null);
	let zoom = $state<{ id: number; code: string } | null>(null);
	/** Pesanan yang baru dikonfirmasi: tampilkan tombol kabari pembeli */
	let done = $state<{ code: string; customerName: string; total: number; phone: string; token: string }[]>([]);

	const statusUrl = (token: string) => `${data.origin}/shop/pesanan/${token}`;
	const split = (n: number) => {
		const s = rupiah(n);
		return [s.slice(0, -3), s.slice(-3)];
	};

	function act(row: (typeof data.rows)[number]): SubmitFunction {
		return () =>
			async ({ result, update }) => {
				if (result.type === 'success') {
					if (result.data?.confirmed) {
						done = [{ code: row.code, customerName: row.customerName, total: row.total, phone: row.phone, token: row.token }, ...done];
						toast.success(`${row.code} lunas`);
					} else toast.success(`Bukti ${row.code} ditolak`);
					rejecting = null;
				} else if (result.type === 'failure') toast.error(String(result.data?.message ?? 'Gagal'));
				await update();
			};
	}
</script>

<svelte:head><title>Konfirmasi bayar — Admin Toko Indah Expres</title></svelte:head>

<PageHeader
	title="Konfirmasi bayar"
	description="Cocokkan nominal unik dengan riwayat transaksi di GoPay Merchant, lalu tandai lunas. Yang PO-nya paling cepat tutup ada di atas."
/>

{#if done.length}
	<div class="mb-6 rounded-lg border border-success/30 bg-success-soft p-4">
		<p class="flex items-center gap-2 font-semibold text-success"><PartyPopper class="size-4" /> Dikonfirmasi barusan — kabari pembeli:</p>
		<ul class="mt-2 grid gap-2">
			{#each done as d (d.code)}
				<li class="flex flex-wrap items-center justify-between gap-2 text-sm">
					<span><b>{d.code}</b> · {d.customerName}</span>
					<WaButton size="sm" phone={d.phone} text={waText.paid(d, statusUrl(d.token))} label="Kirim kabar lunas" />
				</li>
			{/each}
		</ul>
	</div>
{/if}

{#if data.rows.length}
	<ul class="grid gap-4">
		{#each data.rows as row (row.id)}
			{@const [head, tail] = split(row.total)}
			<li class="grid gap-4 rounded-lg border bg-white p-4 md:grid-cols-[120px_1fr_auto] md:p-5" data-testid="payment-row">
				<button type="button" class="group relative block h-40 w-full overflow-hidden rounded-md border bg-muted md:h-36 md:w-[120px]" onclick={() => (zoom = { id: row.id, code: row.code })} aria-label="Perbesar bukti bayar {row.code}">
					<img src="/shop/admin/bukti/{row.id}" alt="Bukti bayar {row.code}" class="size-full object-cover transition group-hover:scale-105" loading="lazy" />
					<span class="absolute inset-x-0 bottom-0 bg-ink/70 py-1 text-center text-[11px] text-white">Perbesar</span>
				</button>
				<div class="min-w-0 text-sm">
					<p class="font-display text-xl font-bold">{row.code}</p>
					<p class="font-medium">{row.customerName} · <span class="text-muted-foreground">{fmtPhone(row.phone)} · mitra {row.partnerCode}</span></p>
					<p class="mt-1 text-muted-foreground">{row.summary}</p>
					<p class="mt-2 text-xs text-muted-foreground">
						Bukti dikirim {row.proofAt ? fmtDateTime(row.proofAt) : '-'} · PO terdekat tutup <b class="text-foreground">{fmtDeadline(row.earliestClose)}</b>
					</p>
				</div>
				<div class="flex flex-col items-start gap-3 md:items-end">
					<div class="md:text-right">
						<p class="text-xs text-muted-foreground uppercase">Nominal di GoPay</p>
						<p class="font-display text-3xl font-bold tabular-nums">{head}<span class="rounded bg-brand-soft px-0.5 text-brand">{tail}</span></p>
						<p class="text-xs text-muted-foreground">kode unik {row.uniqueCode}</p>
					</div>
					<div class="flex gap-2">
						<form method="POST" action="?/confirm" use:enhance={act(row)}>
							<input type="hidden" name="orderId" value={row.id} />
							<Button type="submit" class="bg-success hover:bg-success/90"><Check class="size-4" /> Konfirmasi lunas</Button>
						</form>
						<Button variant="outline" onclick={() => (rejecting = rejecting === row.id ? null : row.id)}><X class="size-4" /> Tolak</Button>
					</div>
				</div>
				{#if rejecting === row.id}
					<form method="POST" action="?/reject" use:enhance={act(row)} class="flex flex-col gap-2 rounded-md bg-muted/50 p-3 md:col-span-3 md:flex-row">
						<input type="hidden" name="orderId" value={row.id} />
						<!-- svelte-ignore a11y_autofocus -->
						<input name="reason" required minlength="3" autofocus placeholder="Alasan, mis. nominal tidak ditemukan di GoPay Merchant" class="h-10 flex-1 rounded-md border bg-white px-3 text-sm outline-none focus:border-brand" />
						<Button type="submit" variant="destructive">Tolak bukti</Button>
						<WaButton size="sm" phone={row.phone} text={waText.rejected(row, 'bukti bayar belum sesuai', statusUrl(row.token))} label="Chat pembeli" class="h-10" />
					</form>
				{/if}
			</li>
		{/each}
	</ul>
{:else}
	<div class="rounded-lg border border-dashed bg-white p-10 text-center text-muted-foreground">Tidak ada pembayaran yang menunggu konfirmasi.</div>
{/if}

<Dialog.Root open={zoom !== null} onOpenChange={(o) => !o && (zoom = null)}>
	<Dialog.Content class="max-h-[92dvh] overflow-y-auto sm:max-w-xl">
		<Dialog.Header><Dialog.Title>Bukti bayar {zoom?.code}</Dialog.Title></Dialog.Header>
		{#if zoom}<img src="/shop/admin/bukti/{zoom.id}" alt="Bukti bayar {zoom.code}" class="w-full rounded-md" />{/if}
	</Dialog.Content>
</Dialog.Root>

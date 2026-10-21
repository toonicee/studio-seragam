<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';
	import Minus from '@lucide/svelte/icons/minus';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
	import { fmtDayShort, rupiah } from '$lib/shop/format';
	import type { CartView } from '$lib/shop/types';
	import { cartAction } from './cart-actions';

	let { cart, open = $bindable(false) }: { cart: CartView; open?: boolean } = $props();
</script>

<Sheet.Root bind:open>
	<Sheet.Content side="right" class="flex w-full flex-col gap-0 p-0 sm:max-w-md">
		<Sheet.Header class="border-b px-5 py-4">
			<Sheet.Title class="font-display text-2xl font-bold tracking-wide uppercase">Keranjang</Sheet.Title>
			<Sheet.Description>
				{cart.count ? `${cart.count} barang · semua produk dijual pre-order` : 'Belum ada barang'}
			</Sheet.Description>
		</Sheet.Header>

		{#if cart.lines.length}
			<ul class="flex-1 divide-y overflow-y-auto px-5" data-testid="cart-lines">
				{#each cart.lines as line (line.key)}
					<li class="flex gap-3 py-4">
						<a href="/shop/produk/{line.slug}" onclick={() => (open = false)} class="shrink-0">
							{#if line.image}
								<img
									src={line.image.src}
									alt=""
									width="72"
									height="90"
									class="h-[90px] w-[72px] rounded-md bg-surface object-cover"
									style:object-position={line.image.src.endsWith('.jpg') ? 'center 15%' : 'center'}
								/>
							{/if}
						</a>
						<div class="min-w-0 flex-1">
							<div class="flex items-start justify-between gap-2">
								<a href="/shop/produk/{line.slug}" onclick={() => (open = false)} class="font-semibold leading-snug hover:text-brand">
									{line.name}
								</a>
								<form method="POST" action="/shop/keranjang?/remove" use:enhance={cartAction}>
									<input type="hidden" name="key" value={line.key} />
									<button class="-mt-1 -mr-1 grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive" aria-label="Hapus {line.name}">
										<Trash2 class="size-4" />
									</button>
								</form>
							</div>
							<p class="text-sm text-muted-foreground">
								{line.size ? `Ukuran ${line.size}` : 'Satu ukuran'} · {rupiah(line.price)}
							</p>
							{#if line.problem}
								<p class="mt-1 text-xs font-medium text-destructive">{line.problem}</p>
							{:else if line.batch}
								<p class="mt-1 text-xs text-muted-foreground">PO ditutup {fmtDayShort(line.batch.closesAt)}, 23:59 WIB</p>
							{/if}
							<div class="mt-2 flex items-center justify-between">
								<form method="POST" action="/shop/keranjang?/update" use:enhance={cartAction} class="flex items-center rounded-md border">
									<input type="hidden" name="key" value={line.key} />
									<button name="qty" value={line.qty - 1} class="grid size-8 place-items-center hover:bg-muted" aria-label="Kurangi">
										<Minus class="size-3.5" />
									</button>
									<span class="w-8 text-center text-sm font-semibold tabular-nums">{line.qty}</span>
									<button name="qty" value={line.qty + 1} class="grid size-8 place-items-center hover:bg-muted" aria-label="Tambah">
										<Plus class="size-3.5" />
									</button>
								</form>
								<span class="font-semibold tabular-nums">{rupiah(line.lineTotal)}</span>
							</div>
						</div>
					</li>
				{/each}
			</ul>
			<div class="border-t bg-muted/40 px-5 py-4">
				<div class="flex items-baseline justify-between">
					<span class="text-sm text-muted-foreground">Subtotal</span>
					<span class="font-display text-2xl font-bold">{rupiah(cart.subtotal)}</span>
				</div>
				<p class="mt-1 text-xs text-muted-foreground">Ongkir dan kode unik ditambahkan saat checkout.</p>
				{#if !cart.ready}
					<p class="mt-2 text-xs font-medium text-destructive">Hapus barang yang PO-nya sudah ditutup untuk lanjut.</p>
				{/if}
				<div class="mt-4 grid gap-2">
					<Button href={cart.ready ? '/shop/checkout' : undefined} disabled={!cart.ready} size="lg" class="h-12 text-base font-semibold" onclick={() => (open = false)}>
						Checkout
					</Button>
					<Button href="/shop/keranjang" variant="outline" size="lg" class="h-11" onclick={() => (open = false)}>Lihat keranjang</Button>
				</div>
			</div>
		{:else}
			<div class="grid flex-1 place-content-center justify-items-center gap-3 px-8 text-center">
				<ShoppingBag class="size-12 text-muted-foreground/60" />
				<p class="font-medium">Keranjang masih kosong</p>
				<p class="text-sm text-muted-foreground">Pilih merchandise yang sedang dibuka PO-nya.</p>
				<Button href="/shop/katalog" class="mt-2" onclick={() => (open = false)}>Lihat katalog</Button>
			</div>
		{/if}
	</Sheet.Content>
</Sheet.Root>

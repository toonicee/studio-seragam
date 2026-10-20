-- =====================================================================
-- STUDIO SERAGAM — SUPABASE DATABASE SCHEMA
-- Jalankan skrip ini di SQL Editor Supabase Dashboard Anda.
-- =====================================================================

-- 1. Tabel designs (Menyimpan konfigurasi 3D seragam yang dibagikan)
CREATE TABLE IF NOT EXISTS public.designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE,
    product TEXT NOT NULL,
    state_data JSONB NOT NULL,
    preview_front TEXT,
    preview_back TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks untuk pencarian cepat via slug / id
CREATE INDEX IF NOT EXISTS idx_designs_slug ON public.designs(slug);
CREATE INDEX IF NOT EXISTS idx_designs_created_at ON public.designs(created_at DESC);

-- 2. Tabel orders (Menyimpan pesanan & permintaan penawaran dari pelanggan)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    design_id UUID REFERENCES public.designs(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_org TEXT,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    notes TEXT,
    total_qty INTEGER NOT NULL DEFAULT 0,
    total_price NUMERIC,
    product_name TEXT NOT NULL,
    material_name TEXT NOT NULL,
    breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    summary_text TEXT NOT NULL,
    preview_front TEXT,
    preview_back TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'dikonfirmasi', 'diproses', 'selesai', 'dibatalkan')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 3. Row Level Security (RLS)
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy untuk designs: Siapa saja bisa membuat dan membaca desain
DROP POLICY IF EXISTS "Public can view designs" ON public.designs;
CREATE POLICY "Public can view designs" ON public.designs
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert designs" ON public.designs;
CREATE POLICY "Public can insert designs" ON public.designs
    FOR INSERT WITH CHECK (true);

-- Policy untuk orders: Pengunjung bisa memasukkan pesanan baru & melihat pesanan mereka
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
CREATE POLICY "Public can insert orders" ON public.orders
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read orders" ON public.orders;
CREATE POLICY "Public can read orders" ON public.orders
    FOR SELECT USING (true);

-- 4. Storage Buckets (Jalankan via UI Storage atau via fungsi berikut jika ekstensi storage aktif)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true), ('mockups', 'mockups', true)
ON CONFLICT (id) DO NOTHING;

-- Policy untuk storage logos & mockups
DROP POLICY IF EXISTS "Public read access on logos" ON storage.objects;
CREATE POLICY "Public read access on logos" ON storage.objects
    FOR SELECT USING (bucket_id = 'logos');

DROP POLICY IF EXISTS "Public insert access on logos" ON storage.objects;
CREATE POLICY "Public insert access on logos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'logos');

DROP POLICY IF EXISTS "Public read access on mockups" ON storage.objects;
CREATE POLICY "Public read access on mockups" ON storage.objects
    FOR SELECT USING (bucket_id = 'mockups');

DROP POLICY IF EXISTS "Public insert access on mockups" ON storage.objects;
CREATE POLICY "Public insert access on mockups" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'mockups');

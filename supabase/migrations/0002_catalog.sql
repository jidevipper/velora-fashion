-- ============================================================
-- VELORA — Catalog (products + collections)
-- Run this after 0001_orders_admin.sql
-- ============================================================

-- PRODUCTS
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10,2) not null default 0,
  image text not null default '',
  category text not null default 'Men',
  description text not null default '',
  available boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- Everyone can browse the catalog
create policy "products_select_all" on public.products
  for select using (true);

-- Only admins can add / edit / remove products
create policy "products_admin_all" on public.products
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- COLLECTIONS
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tagline text not null default '',
  image text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.collections enable row level security;

create policy "collections_select_all" on public.collections
  for select using (true);

create policy "collections_admin_all" on public.collections
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================================================
-- SEED DATA (the original Velora catalog)
-- ============================================================

insert into public.collections (name, tagline, image, sort_order) values
  ('Men', 'Modern Luxury', 'https://velora-fashion-fawn.vercel.app/images/hero-2.jpg', 1),
  ('Women', 'Elegant Style', 'https://velora-fashion-fawn.vercel.app/images/about.jpg', 2),
  ('Accessories', 'Premium Collection', 'https://velora-fashion-fawn.vercel.app/images/collection.jpg', 3)
on conflict do nothing;

insert into public.products (name, price, image, category, description, available) values
  ('Luxury Jacket', 149, 'https://velora-fashion-fawn.vercel.app/images/product-1.jpg', 'Men', '', true),
  ('Classic Suit', 220, 'https://velora-fashion-fawn.vercel.app/images/product-2.jpg', 'Men', '', true),
  ('Designer Hoodie', 89, 'https://velora-fashion-fawn.vercel.app/images/product-3.jpg', 'Men', '', true),
  ('Premium Sneakers', 170, 'https://velora-fashion-fawn.vercel.app/images/product-4.jpg', 'Accessories', '', true),
  ('Street Fashion', 120, 'https://velora-fashion-fawn.vercel.app/images/product-5.jpg', 'Women', '', true),
  ('Luxury Outfit', 260, 'https://velora-fashion-fawn.vercel.app/images/product-6.jpg', 'Women', '', true)
on conflict do nothing;

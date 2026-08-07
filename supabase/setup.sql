-- ============================================================
-- VELORA — Admin panel schema
-- Run this once in Supabase > SQL Editor
-- ============================================================

-- PROFILES: one row per auth user, carries the admin role
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

-- Admin helper: reads the role WITHOUT re-triggering RLS on
-- profiles (avoids "infinite recursion detected in policy")
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;

create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin());

-- Auto-create a profile when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ORDERS: shared order store (customers + admin)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  order_id text not null,
  status text not null default 'Order Placed',
  total numeric(10,2) not null default 0,
  items jsonb not null default '[]',
  shipping_address text not null default '',
  payment_method text not null default '',
  email text not null default '',
  name text not null default '',
  date timestamptz not null default now()
);

alter table public.orders enable row level security;

-- Anyone can place an order (guest checkout)
create policy "orders_insert_any" on public.orders
  for insert with check (true);

-- Customers see their own orders
create policy "orders_select_own" on public.orders
  for select using (
    auth.uid() = user_id
    or email = auth.jwt() ->> 'email'
  );

-- Admins can read and update all orders
create policy "orders_admin_all" on public.orders
  for all using (public.is_admin());

-- ============================================================
-- Make YOUR account an admin (run after signing in once):
-- update public.profiles set role = 'admin'
-- where email = 'YOUR_GOOGLE_EMAIL_HERE';
-- ============================================================

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
  for all using (public.is_admin());

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
  for all using (public.is_admin());

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

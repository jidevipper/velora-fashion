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

create policy "profiles_admin_all" on public.profiles
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

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
    or email = (select email from auth.users where id = auth.uid())
  );

-- Admins can read and update all orders
create policy "orders_admin_all" on public.orders
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================================================
-- Make YOUR account an admin (run after signing in once):
-- update public.profiles set role = 'admin'
-- where email = 'YOUR_GOOGLE_EMAIL_HERE';
-- ============================================================

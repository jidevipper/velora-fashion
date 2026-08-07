-- ============================================================
-- VELORA — Fix RLS infinite recursion in admin policies
-- Run this once in Supabase > SQL Editor
--
-- The old policies checked "am I admin?" by querying profiles
-- from inside a policy ON profiles, which Postgres rejects with
-- 42P17 (infinite recursion) and every admin query fails with
-- a 500, so /admin always showed "Access Denied".
--
-- Fix: a SECURITY DEFINER helper that reads the role without
-- triggering RLS, used by all admin policies.
-- ============================================================

-- Helper: is the current user an admin? (bypasses RLS safely)
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

-- PROFILES
drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin());

-- ORDERS
drop policy if exists "orders_admin_all" on public.orders;
create policy "orders_admin_all" on public.orders
  for all using (public.is_admin());

-- Orders: customers see their own (also fix auth.users subquery,
-- which the authenticated role cannot read)
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select using (
    auth.uid() = user_id
    or email = auth.jwt() ->> 'email'
  );

-- PRODUCTS
drop policy if exists "products_admin_all" on public.products;
create policy "products_admin_all" on public.products
  for all using (public.is_admin());

-- COLLECTIONS
drop policy if exists "collections_admin_all" on public.collections;
create policy "collections_admin_all" on public.collections
  for all using (public.is_admin());

-- ============================================================
-- Make YOUR account an admin (run after signing in once):
-- update public.profiles set role = 'admin'
-- where email = 'YOUR_EMAIL_HERE';
-- ============================================================

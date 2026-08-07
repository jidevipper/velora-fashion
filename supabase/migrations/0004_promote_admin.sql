-- ============================================================
-- VELORA — Fix admin access
--
-- The is_admin() helper is security definer, but the previous
-- migrations did `revoke all on function public.is_admin() from
-- public`, which also removed EXECUTE from the `authenticated` and
-- `anon` roles. Every RLS policy that calls is_admin() then fails
-- with "permission denied for function is_admin", so /admin always
-- showed "Access Denied".
--
-- Fix: re-grant EXECUTE so the policies can actually run.
-- ============================================================

grant execute on function public.is_admin() to anon, authenticated, service_role;

-- ============================================================
-- Promote the store owner to admin.
-- Run this AFTER signing in once with that Google account
-- (the signup trigger creates the profiles row on first sign-in).
-- ============================================================
update public.profiles
set role = 'admin'
where email = 'olajideshola009@gmail.com';
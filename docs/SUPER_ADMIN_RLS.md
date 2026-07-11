Super Admin RLS and testing guide

Overview

This document explains recommended Row Level Security (RLS) policies and tests so that the owner `admin@hadeestrading.co.za` is always treated as `super_admin` and bypasses restrictive staff-only checks.

Key points

- Use a single canonical check function in the DB (e.g. `public.is_super_admin_current_user()`) and reference it from RLS policies.
- Ensure the owner has an entry in `user_roles` with `role = 'super_admin'` and/or `profiles.role = 'super_admin'`.
- Add a `super_admin_full_access` policy on critical tables to allow full CRUD for super admins.

Example RLS policy (Postgres / Supabase)

-- helper function already created by migration:
CREATE OR REPLACE FUNCTION public.is_super_admin_current_user()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND lower(ur.role) = 'super_admin'
  )
  OR EXISTS(
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND lower(p.role) = 'super_admin'
  )
  OR (auth.uid() IS NULL AND current_setting('request.jwt.claims.email', true) = 'admin@hadeestrading.co.za');
$$;

-- Policy to grant full access to super_admin on `clients` (repeat for other tables)
CREATE POLICY super_admin_full_access ON public.clients
USING (public.is_super_admin_current_user())
WITH CHECK (public.is_super_admin_current_user());

Troubleshooting / Tests

1. Log in as `admin@hadeestrading.co.za` and run a SELECT on protected table (e.g., `clients`) via the API or SQL editor as the authenticated user — it should return rows.
2. From Supabase SQL editor (service role) run:
   SELECT * FROM public.user_roles WHERE role = 'super_admin';
   Confirm owner user_id appears.
3. Check `profiles` for `role = 'super_admin'`.
4. If frontend still blocks, inspect `src/hooks/use-auth.tsx` and `user_roles` table usage — ensure `super_admin` role name matches casing used in code (`super_admin` vs `SUPER_ADMIN`).

Frontend note

This repo uses `user_roles` and `useRoles()` (see `src/hooks/use-auth.tsx`). The frontend treats `super_admin` as special: ensure your DB role names match the frontend string values.

Security reminder

Only run the provided migration and scripts with the Supabase service role key in a secure environment; never expose the service role key to client-side code.

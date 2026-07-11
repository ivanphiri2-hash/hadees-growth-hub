-- Migration: Grant super_admin role to admin@hadeestrading.co.za and add RLS policies
-- Run this in your Supabase SQL editor or migration tool.

BEGIN;

-- Normalize profiles.role to lowercase if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='role') THEN
    UPDATE public.profiles
    SET role = lower(role)
    WHERE role IS NOT NULL;
  END IF;
END
$$;

-- Update the owner profile to have role 'super_admin' (if column exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='profiles') THEN
    UPDATE public.profiles
    SET role = 'super_admin'
    WHERE lower(email) = 'admin@hadeestrading.co.za';
  END IF;
END
$$;

-- Ensure user_roles table exists and insert a record for the owner
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_roles') THEN
    INSERT INTO public.user_roles (user_id, role, created_at)
    SELECT p.id, 'super_admin', now()
    FROM public.profiles p
    WHERE lower(p.email) = 'admin@hadeestrading.co.za'
      AND NOT EXISTS (
        SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND lower(ur.role) = 'super_admin'
      );
  END IF;
END
$$;

-- Create a consistent helper function usable in RLS policies
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

-- For a set of common admin tables, enable RLS and add a policy that grants full access to super_admins
DO $$
DECLARE
  _tbl text;
  _tables text[] := ARRAY['clients','leads','bookings','invoices','projects','tenders','payments','user_roles','profiles'];
BEGIN
  FOREACH _tbl IN ARRAY _tables LOOP
    IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = _tbl) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', _tbl);

      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = _tbl AND policyname = 'super_admin_full_access'
      ) THEN
        EXECUTE format($SQL$
          CREATE POLICY super_admin_full_access ON public.%I
          USING (public.is_super_admin_current_user())
          WITH CHECK (public.is_super_admin_current_user());
        $SQL$, _tbl);
      END IF;
    END IF;
  END LOOP;
END
$$;

COMMIT;

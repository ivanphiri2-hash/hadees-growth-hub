-- Migration: Make admin@hadeestrading.co.za a permanent SUPER_ADMIN
-- Creates helper functions to check for SUPER_ADMIN and updates the profiles table.
-- Run this migration in your Supabase project's SQL editor or migrate tool.

BEGIN;

-- Ensure SUPER_ADMIN exists in a roles table if present
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'roles') THEN
    IF NOT EXISTS (SELECT 1 FROM public.roles WHERE name = 'SUPER_ADMIN') THEN
      INSERT INTO public.roles (name, created_at)
      VALUES ('SUPER_ADMIN', now());
    END IF;
  END IF;
END
$$;

-- Mark the owner account as SUPER_ADMIN in the profiles table (adjust column names if different)
-- If your app stores roles in a different table/column, adapt this UPDATE accordingly.
UPDATE public.profiles
SET role = 'SUPER_ADMIN'
WHERE email = 'admin@hadeestrading.co.za';

-- Create helper function by email
CREATE OR REPLACE FUNCTION public.is_super_admin_by_email(p_email text)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE email = p_email AND role = 'SUPER_ADMIN');
$$;

-- Create helper function by auth uid (useful inside RLS policies)
CREATE OR REPLACE FUNCTION public.is_super_admin_by_auth_uid(p_uid uuid)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = p_uid AND role = 'SUPER_ADMIN');
$$;

-- Create helper function using auth.uid() for direct RLS checks
CREATE OR REPLACE FUNCTION public.is_super_admin_current_user()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN');
$$;

-- Optionally enable RLS on profiles and add a policy that allows SUPER_ADMIN full access
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    -- Enable RLS (no-op if already enabled)
    EXECUTE 'ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY';

    -- Create a dedicated policy that ensures SUPER_ADMIN bypasses restrictive checks for this table
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'super_admin_full_access'
    ) THEN
      EXECUTE 'CREATE POLICY super_admin_full_access ON public.profiles USING (role = ''SUPER_ADMIN'') WITH CHECK (role = ''SUPER_ADMIN'')';
    END IF;
  END IF;
END
$$;

COMMIT;

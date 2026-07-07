
-- 1. has_role treats super_admin as any role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND (role = _role OR role = 'super_admin')
  );
$$;

-- 2. is_super_admin helper
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'
  );
$$;

-- 3. Grant owner Super Admin (permanent)
DO $$
DECLARE owner_id uuid;
BEGIN
  SELECT id INTO owner_id FROM auth.users WHERE lower(email) = 'admin@hadeestrading.co.za' LIMIT 1;
  IF owner_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (owner_id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    -- ensure profile exists
    INSERT INTO public.profiles (id, full_name, phone)
    VALUES (owner_id, 'Hadees Trading Admin', '')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- 4. Auto-create a client record when a new profile is created
CREATE OR REPLACE FUNCTION public.handle_new_profile_client()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.clients (user_id, company, status)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.full_name, ''), 'New Client'),
    'active'
  )
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_client ON public.profiles;
CREATE TRIGGER on_profile_created_client
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile_client();

-- 5. Enable realtime on core CRM tables
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.leads; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.clients; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

ALTER TABLE public.leads REPLICA IDENTITY FULL;
ALTER TABLE public.bookings REPLICA IDENTITY FULL;
ALTER TABLE public.clients REPLICA IDENTITY FULL;

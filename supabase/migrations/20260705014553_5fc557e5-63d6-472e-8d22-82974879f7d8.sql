
-- Ensure pgcrypto for bcrypt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Locate or create the admin user
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@hadeestrading.co.za' LIMIT 1;

  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users
      WHERE email ILIKE 'hadeestradingpytyltd%' OR email = 'hadeestradingpytyltd@gmail.com'
      ORDER BY created_at ASC LIMIT 1;
  END IF;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, is_sso_user
    ) VALUES (
      v_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'admin@hadeestrading.co.za', crypt('@0837535798Tp', gen_salt('bf')),
      now(), now(), now(),
      jsonb_build_object('provider','email','providers',jsonb_build_array('email')),
      jsonb_build_object('full_name','Hadees Admin'), false, false
    );
    INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_user_id::text, v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', 'admin@hadeestrading.co.za', 'email_verified', true),
      'email', now(), now(), now());
  ELSE
    UPDATE auth.users
      SET email = 'admin@hadeestrading.co.za',
          encrypted_password = crypt('@0837535798Tp', gen_salt('bf')),
          email_confirmed_at = COALESCE(email_confirmed_at, now()),
          updated_at = now(),
          raw_app_meta_data = COALESCE(raw_app_meta_data,'{}'::jsonb) ||
            jsonb_build_object('provider','email','providers',jsonb_build_array('email'))
      WHERE id = v_user_id;
    UPDATE auth.identities
      SET identity_data = COALESCE(identity_data,'{}'::jsonb) ||
        jsonb_build_object('email','admin@hadeestrading.co.za','email_verified',true),
          updated_at = now()
      WHERE user_id = v_user_id AND provider = 'email';
  END IF;

  INSERT INTO public.profiles (id, full_name, phone)
    VALUES (v_user_id, 'Hadees Admin', '')
    ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
END $$;

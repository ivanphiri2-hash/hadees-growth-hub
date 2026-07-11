import { supabaseAdmin } from '@/integrations/supabase/client.server';

export async function ensureSuperAdminByEmail(email: string) {
  // Use the admin client to bypass RLS and ensure the user has super_admin role
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, email')
    .ilike('email', email)
    .limit(1)
    .maybeSingle();

  if (!profile) return { success: false, message: 'Profile not found' };

  // insert into user_roles if not exists
  await supabaseAdmin.from('user_roles').upsert([
    { user_id: profile.id, role: 'super_admin' }
  ], { onConflict: ['user_id', 'role'] });

  // also update profiles.role column if present
  await supabaseAdmin.from('profiles').update({ role: 'super_admin' }).eq('id', profile.id);

  return { success: true, message: 'Super admin ensured', id: profile.id };
}

export async function isSuperAdminByAuthUid(uid: string) {
  const { data } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', uid)
    .eq('role', 'super_admin')
    .limit(1)
    .maybeSingle();
  return !!data;
}

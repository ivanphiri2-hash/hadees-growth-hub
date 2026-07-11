#!/usr/bin/env node
// Ensure Super Admin script for Supabase using service role key
// Usage (PowerShell/CMD/Bash):
// SUPABASE_URL="https://..." SUPABASE_SERVICE_ROLE_KEY="..." node scripts/ensure-super-admin.js admin@hadeestrading.co.za

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(2);
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/ensure-super-admin.js <email>');
  process.exit(2);
}

const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

async function fetchJson(path, opts = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers, ...opts });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : null; } catch (e) { json = text; }
  if (!res.ok) {
    throw new Error(`Supabase request failed ${res.status}: ${text}`);
  }
  return json;
}

(async () => {
  try {
    // 1) Query profiles by email
    const profiles = await fetchJson(`profiles?email=eq.${encodeURIComponent(email)}&select=id,email`);
    if (!Array.isArray(profiles) || profiles.length === 0) {
      console.error('Profile not found for', email);
      process.exit(3);
    }
    const profile = profiles[0];
    console.log('Found profile:', profile.id, profile.email);

    // 2) Ensure user_roles exists and insert if missing
    const ur = await fetchJson(`user_roles?user_id=eq.${profile.id}&role=eq.super_admin&select=user_id,role`);
    if (Array.isArray(ur) && ur.length > 0) {
      console.log('user_roles already contains super_admin for this user.');
    } else {
      const insert = await fetchJson('user_roles', {
        method: 'POST',
        body: JSON.stringify([{ user_id: profile.id, role: 'super_admin', created_at: new Date().toISOString() }]),
        headers: { ...headers, Prefer: 'return=representation' },
      });
      console.log('Inserted user_roles:', insert);
    }

    // 3) Update profiles.role column if present
    // Try PATCH; if table/column doesn't exist, PostgREST will return 400/404
    try {
      const upd = await fetchJson(`profiles?id=eq.${profile.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ role: 'super_admin' }),
        headers: { ...headers, Prefer: 'return=representation' },
      });
      console.log('Updated profiles:', upd);
    } catch (e) {
      console.warn('Could not update profiles role column (it may not exist).', e.message);
    }

    console.log('Done. Confirm in Supabase dashboard or run queries to verify.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
})();

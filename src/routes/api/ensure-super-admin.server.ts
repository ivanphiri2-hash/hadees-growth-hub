import type { RequestHandler } from '@tanstack/react-start/server-entry';
import { ensureSuperAdminByEmail } from '@/lib/super-admin.server';

export default (async function ensureSuperAdminRoute(req: Request) {
  // This route is intentionally server-only. It will only run when the env flag is set.
  const RUN_ONCE = process.env.RUN_ONCE_ENSURE_SUPER_ADMIN;
  const SECRET = process.env.ENSURE_SUPER_ADMIN_SECRET;

  if (!RUN_ONCE) return new Response('disabled', { status: 204 });
  // require a one-time secret to prevent accidental invocation
  const url = new URL(req.url);
  const token = url.searchParams.get('secret');
  if (!SECRET || token !== SECRET) return new Response('forbidden', { status: 403 });

  const email = 'admin@hadeestrading.co.za';
  const result = await ensureSuperAdminByEmail(email);
  return new Response(JSON.stringify(result), { status: 200, headers: { 'content-type': 'application/json' } });
}) as unknown as RequestHandler;
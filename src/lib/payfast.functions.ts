import { createServerFn } from "@tanstack/react-start";
import { createHash } from "crypto";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({ orderId: z.string().uuid() });

function pfEncode(v: string) {
  // PayFast uses application/x-www-form-urlencoded with spaces as '+', uppercase hex.
  return encodeURIComponent(v).replace(/%20/g, "+").replace(/%[0-9a-f]{2}/g, (m) => m.toUpperCase());
}

function pfSignature(fields: Record<string, string>, passphrase: string | undefined) {
  const parts = Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}=${pfEncode(String(v).trim())}`);
  if (passphrase && passphrase.trim().length > 0) {
    parts.push(`passphrase=${pfEncode(passphrase.trim())}`);
  }
  return createHash("md5").update(parts.join("&")).digest("hex");
}

export const createPayfastPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => schema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Fetch the order + verify the caller owns the underlying client record.
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, title, amount_cents, currency, status, client_id, clients!inner(user_id)")
      .eq("id", data.orderId)
      .single();

    if (orderErr || !order) throw new Error("Order not found");
    // @ts-expect-error joined shape
    if (order.clients?.user_id !== userId) throw new Error("Forbidden");
    if (order.status === "paid") throw new Error("Order already paid");
    if (order.currency !== "ZAR") throw new Error("PayFast only supports ZAR");

    const merchantId = process.env.PAYFAST_MERCHANT_ID!;
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY!;
    const passphrase = process.env.PAYFAST_PASSPHRASE;
    const sandbox = (process.env.PAYFAST_SANDBOX ?? "true").toLowerCase() !== "false";
    const host = sandbox ? "sandbox.payfast.co.za" : "www.payfast.co.za";

    const origin = new URL(context.claims?.iss ?? "https://hadeestrading.co.za").origin;
    // Prefer request origin so return URLs match the actual deployment.
    const reqOrigin = (() => {
      try {
        const { getRequestHeader } = require("@tanstack/react-start/server") as typeof import("@tanstack/react-start/server");
        const h = getRequestHeader("origin") || getRequestHeader("referer");
        return h ? new URL(h).origin : origin;
      } catch {
        return origin;
      }
    })();

    const paymentRef = `HTPL-${order.id.slice(0, 8)}-${Date.now()}`;

    // Persist reference before redirecting so ITN can look it up.
    await supabase
      .from("orders")
      .update({ payment_reference: paymentRef, payment_provider: "payfast", status: "pending_payment" })
      .eq("id", order.id);

    const fields: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: `${reqOrigin}/orders?payment=success`,
      cancel_url: `${reqOrigin}/orders?payment=cancelled`,
      notify_url: `${reqOrigin}/api/public/payfast/itn`,
      m_payment_id: paymentRef,
      amount: (order.amount_cents / 100).toFixed(2),
      item_name: order.title.slice(0, 100),
      custom_str1: order.id,
    };

    const signature = pfSignature(fields, passphrase);
    return {
      action: `https://${host}/eng/process`,
      fields: { ...fields, signature },
    };
  });

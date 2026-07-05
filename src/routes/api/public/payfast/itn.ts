import { createFileRoute } from "@tanstack/react-router";
import { createHash } from "crypto";

// PayFast source IPs (production + sandbox).
const PAYFAST_HOSTS = [
  "www.payfast.co.za",
  "sandbox.payfast.co.za",
  "w1w.payfast.co.za",
  "w2w.payfast.co.za",
];

function pfEncode(v: string) {
  return encodeURIComponent(v).replace(/%20/g, "+").replace(/%[0-9a-f]{2}/g, (m) => m.toUpperCase());
}

function computeSignature(fields: Record<string, string>, passphrase: string | undefined) {
  const parts = Object.entries(fields)
    .filter(([k, v]) => k !== "signature" && v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}=${pfEncode(String(v).trim())}`);
  if (passphrase && passphrase.trim().length > 0) {
    parts.push(`passphrase=${pfEncode(passphrase.trim())}`);
  }
  return createHash("md5").update(parts.join("&")).digest("hex");
}

export const Route = createFileRoute("/api/public/payfast/itn")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        const params = new URLSearchParams(raw);
        const fields: Record<string, string> = {};
        // Preserve insertion order from the POST body — required for the signature.
        for (const [k, v] of params.entries()) fields[k] = v;

        const passphrase = process.env.PAYFAST_PASSPHRASE;
        const sandbox = (process.env.PAYFAST_SANDBOX ?? "true").toLowerCase() !== "false";

        // 1. Signature check.
        const expected = computeSignature(fields, passphrase);
        if ((fields.signature ?? "").toLowerCase() !== expected.toLowerCase()) {
          return new Response("Invalid signature", { status: 400 });
        }

        // 2. Merchant id check.
        if (fields.merchant_id !== process.env.PAYFAST_MERCHANT_ID) {
          return new Response("Bad merchant", { status: 400 });
        }

        // 3. Server-to-server validation (postback to PayFast).
        const validateHost = sandbox ? "sandbox.payfast.co.za" : "www.payfast.co.za";
        const validate = await fetch(`https://${validateHost}/eng/query/validate`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: raw,
        });
        const validateText = (await validate.text()).trim();
        if (!validateText.startsWith("VALID")) {
          return new Response("Not validated", { status: 400 });
        }

        // 4. Update the order (privileged; ITN is server-to-server, no user session).
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const orderId = fields.custom_str1;
        const paymentRef = fields.m_payment_id;
        const status = fields.payment_status; // COMPLETE / FAILED / CANCELLED

        const { data: order } = await supabaseAdmin
          .from("orders")
          .select("id, amount_cents, currency")
          .eq("id", orderId)
          .maybeSingle();

        if (!order) return new Response("Unknown order", { status: 200 });

        const expectedAmount = (order.amount_cents / 100).toFixed(2);
        if (Number(fields.amount_gross).toFixed(2) !== expectedAmount) {
          return new Response("Amount mismatch", { status: 200 });
        }

        if (status === "COMPLETE") {
          await supabaseAdmin
            .from("orders")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
              payfast_pf_payment_id: fields.pf_payment_id,
              payment_reference: paymentRef,
              payment_provider: "payfast",
            })
            .eq("id", orderId);
        } else {
          await supabaseAdmin
            .from("orders")
            .update({ status: status?.toLowerCase() ?? "failed" })
            .eq("id", orderId);
        }

        return new Response("ok");
      },
    },
  },
});

// Silence unused-import lint for host allow-list (kept for reference/docs).
void PAYFAST_HOSTS;

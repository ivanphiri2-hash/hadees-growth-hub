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
          .select("id, client_id, title, description, amount_cents, currency, status")
          .eq("id", orderId)
          .maybeSingle();

        if (!order) return new Response("Unknown order", { status: 200 });

        const expectedAmount = (order.amount_cents / 100).toFixed(2);
        if (Number(fields.amount_gross).toFixed(2) !== expectedAmount) {
          return new Response("Amount mismatch", { status: 200 });
        }

        if (status === "COMPLETE") {
          const alreadyPaid = order.status === "paid";
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

          if (!alreadyPaid) {
            try {
              const { renderInvoicePdf } = await import("@/lib/invoice.server");
              const { data: client } = await supabaseAdmin
                .from("clients")
                .select("id, company, user_id")
                .eq("id", order.client_id)
                .maybeSingle();
              let full_name: string | null = null;
              let email: string | null = fields.email_address ?? null;
              if (client?.user_id) {
                const { data: prof } = await supabaseAdmin
                  .from("profiles").select("full_name").eq("id", client.user_id).maybeSingle();
                full_name = prof?.full_name ?? null;
                const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(client.user_id);
                email = authUser?.user?.email ?? email;
              }
              const invoiceNumber = `INV-${new Date().getFullYear()}-${(paymentRef ?? order.id).slice(-8).toUpperCase()}`;
              const pdf = await renderInvoicePdf({
                invoiceNumber,
                issuedAt: new Date(),
                order,
                client: { company: client?.company ?? null, full_name, email },
                payment: { reference: paymentRef, provider: "payfast", pfPaymentId: fields.pf_payment_id ?? null },
              });
              const path = `${order.client_id}/invoices/${invoiceNumber}.pdf`;
              const { error: upErr } = await supabaseAdmin.storage.from("documents").upload(
                path,
                new Blob([pdf as BlobPart], { type: "application/pdf" }),
                { contentType: "application/pdf", upsert: true },
              );
              if (!upErr) {
                await supabaseAdmin.from("documents").insert({
                  client_id: order.client_id,
                  order_id: order.id,
                  name: `${invoiceNumber}.pdf`,
                  storage_path: path,
                  mime: "application/pdf",
                  size_bytes: pdf.byteLength,
                });
              } else {
                console.error("[payfast-itn] invoice upload failed", upErr);
              }
            } catch (e) {
              console.error("[payfast-itn] invoice generation failed", e);
            }
          }
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

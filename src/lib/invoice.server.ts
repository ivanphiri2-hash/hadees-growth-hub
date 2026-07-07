// Server-only PDF invoice generator using pdf-lib
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type InvoiceInput = {
  invoiceNumber: string;
  issuedAt: Date;
  order: { id: string; title: string; description: string | null; amount_cents: number; currency: string };
  client: { company: string | null; full_name: string | null; email: string | null };
  payment: { reference: string | null; provider: string | null; pfPaymentId: string | null };
  /** Optional override for the public contact email displayed on the invoice. */
  contactEmail?: string;
};

const BRAND = "Hadees Trading (Pty) Ltd";
const DEFAULT_CONTACT_EMAIL = "info@hadeestrading.co.za";
const BRAND_SITE = "https://hadeestrading.co.za";

/** Fetches the configured public contact email from app_settings (server-only). */
export async function getContactEmail(): Promise<string> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("app_settings")
      .select("value")
      .eq("key", "contact_email")
      .maybeSingle();
    return data?.value?.trim() || DEFAULT_CONTACT_EMAIL;
  } catch {
    return DEFAULT_CONTACT_EMAIL;
  }
}

export async function renderInvoicePdf(input: InvoiceInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]); // A4
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const navy = rgb(0.09, 0.16, 0.35);
  const gray = rgb(0.35, 0.38, 0.45);
  const dark = rgb(0.1, 0.1, 0.12);

  const margin = 48;
  let y = 800;

  page.drawText(BRAND, { x: margin, y, size: 18, font: bold, color: navy });
  y -= 18;
  const contactEmail = input.contactEmail?.trim() || (await getContactEmail());
  const brandLines: string[] = [contactEmail, BRAND_SITE];
  brandLines.forEach((l) => { page.drawText(l, { x: margin, y, size: 9, font, color: gray }); y -= 12; });

  y = 800;
  page.drawText("TAX INVOICE", { x: 400, y, size: 18, font: bold, color: navy });
  y -= 22;
  page.drawText(`Invoice #: ${input.invoiceNumber}`, { x: 400, y, size: 10, font, color: dark }); y -= 14;
  page.drawText(`Date: ${input.issuedAt.toISOString().slice(0, 10)}`, { x: 400, y, size: 10, font, color: dark }); y -= 14;
  page.drawText(`Order: ${input.order.id.slice(0, 8)}`, { x: 400, y, size: 10, font, color: dark });

  // Bill to
  y = 720;
  page.drawText("BILL TO", { x: margin, y, size: 9, font: bold, color: gray }); y -= 14;
  const billName = input.client.company || input.client.full_name || "Client";
  page.drawText(billName, { x: margin, y, size: 12, font: bold, color: dark }); y -= 14;
  if (input.client.email) { page.drawText(input.client.email, { x: margin, y, size: 10, font, color: dark }); y -= 12; }

  // Table
  y = 640;
  page.drawRectangle({ x: margin, y: y - 4, width: 595 - margin * 2, height: 22, color: navy });
  page.drawText("DESCRIPTION", { x: margin + 8, y: y + 4, size: 9, font: bold, color: rgb(1, 1, 1) });
  page.drawText("AMOUNT", { x: 460, y: y + 4, size: 9, font: bold, color: rgb(1, 1, 1) });
  y -= 30;

  const amount = (input.order.amount_cents / 100).toFixed(2);
  page.drawText(input.order.title, { x: margin + 8, y, size: 11, font: bold, color: dark });
  page.drawText(`${input.order.currency} ${amount}`, { x: 460, y, size: 11, font: bold, color: dark });
  y -= 14;
  if (input.order.description) {
    const desc = input.order.description.slice(0, 500);
    const lines = wrap(desc, 70);
    for (const l of lines.slice(0, 8)) { page.drawText(l, { x: margin + 8, y, size: 9, font, color: gray }); y -= 11; }
  }

  // Totals
  y -= 30;
  page.drawLine({ start: { x: margin, y }, end: { x: 595 - margin, y }, thickness: 0.5, color: gray });
  y -= 20;
  page.drawText("TOTAL PAID", { x: 380, y, size: 11, font: bold, color: dark });
  page.drawText(`${input.order.currency} ${amount}`, { x: 460, y, size: 11, font: bold, color: navy });

  // Payment details
  y -= 40;
  page.drawText("PAYMENT", { x: margin, y, size: 9, font: bold, color: gray }); y -= 14;
  page.drawText(`Provider: ${input.payment.provider ?? "PayFast"}`, { x: margin, y, size: 10, font, color: dark }); y -= 12;
  if (input.payment.reference) { page.drawText(`Reference: ${input.payment.reference}`, { x: margin, y, size: 10, font, color: dark }); y -= 12; }
  if (input.payment.pfPaymentId) { page.drawText(`PayFast ID: ${input.payment.pfPaymentId}`, { x: margin, y, size: 10, font, color: dark }); y -= 12; }
  page.drawText(`Status: PAID`, { x: margin, y, size: 10, font: bold, color: rgb(0.1, 0.5, 0.2) });

  // Footer
  page.drawText("Thank you for your business.", { x: margin, y: 60, size: 10, font, color: gray });
  page.drawText(BRAND, { x: margin, y: 46, size: 8, font, color: gray });

  return await pdf.save();
}

function wrap(text: string, width: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > width) { if (cur) lines.push(cur); cur = w; }
    else cur = cur ? cur + " " + w : w;
  }
  if (cur) lines.push(cur);
  return lines;
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Calendar, Send } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a Consultation — Hadees Trading" },
      { name: "description", content: "Book a free consultation with Hadees Trading — business registration, digital solutions, and academy enrolment." },
      { property: "og:title", content: "Book a Consultation — Hadees Trading" },
    ],
    links: [{ rel: "canonical", href: "/book" }],
  }),
  component: BookPage,
});

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional(),
  service: z.string().max(100).optional(),
  requested_at: z.string().min(1),
  notes: z.string().max(1000).optional(),
});

function BookPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "Business Registration", requested_at: "", notes: "" });
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Please check the form");
      return;
    }
    setSaving(true);
    const { data: sess } = await supabase.auth.getUser();
    const { error } = await supabase.from("bookings").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      service: parsed.data.service || null,
      requested_at: new Date(parsed.data.requested_at).toISOString(),
      notes: parsed.data.notes || null,
      user_id: sess.user?.id ?? null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Booking request received — we'll confirm shortly.");
    setForm({ name: "", email: "", phone: "", service: "Business Registration", requested_at: "", notes: "" });
  }

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Bookings"
        title="Book a free consultation."
        description="Tell us what you need. A Hadees Trading advisor will confirm your slot via WhatsApp or email."
      />
      <section className="container-x mt-12 mb-20 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <form onSubmit={onSubmit} className="card-elevated p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Your name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
            <Field label="Phone (WhatsApp)" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Service</label>
              <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}
                className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-[color:var(--royal)]">
                <option>Business Registration</option>
                <option>Compliance (SARS / B-BBEE / CIDB)</option>
                <option>Website / Digital Solutions</option>
                <option>Trading Academy</option>
                <option>General consultation</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preferred date & time</label>
            <input type="datetime-local" required value={form.requested_at}
              onChange={(e) => setForm({ ...form, requested_at: e.target.value })}
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-[color:var(--royal)]" />
          </div>
          <div className="mt-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes (optional)</label>
            <textarea rows={4} value={form.notes} maxLength={1000}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-[color:var(--royal)] resize-none"
              placeholder="Anything we should know?" />
          </div>
          <button type="submit" disabled={saving}
            className="mt-6 inline-flex items-center gap-2 rounded-full gradient-royal px-6 py-3 text-sm font-semibold text-white shadow-elegant hover:opacity-90 disabled:opacity-60 transition">
            {saving ? "Submitting…" : "Request Booking"} <Send className="h-4 w-4" />
          </button>
        </form>
        <aside className="card-elevated p-6 h-fit">
          <Calendar className="h-6 w-6 text-[color:var(--royal)]" />
          <h3 className="mt-3 text-lg font-bold">What to expect</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>• 20–30 min discovery call</li>
            <li>• Free needs analysis</li>
            <li>• Clear scope & pricing recommendation</li>
            <li>• No obligation</li>
          </ul>
        </aside>
      </section>
    </SiteLayout>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} maxLength={200}
        className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-[color:var(--royal)]" />
    </div>
  );
}

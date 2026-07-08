import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MessageCircle, Mail, Clock, MapPin, ArrowRight, Send } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { WHATSAPP_NUMBER, waLink } from "@/lib/company";
import { supabase } from "@/integrations/supabase/client";
import { useContactEmail } from "@/hooks/use-app-settings";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Hadees Trading" },
      { name: "description", content: "Get in touch with Hadees Trading. WhatsApp us, send a message, or find our business hours." },
      { property: "og:title", content: "Contact Hadees Trading" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "" });
  const [saving, setSaving] = useState(false);
  const contactEmail = useContactEmail();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("leads").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      service_interest: form.topic || null,
      message: form.message.trim() || null,
      source: "contact_form",
      status: "new",
    });
    setSaving(false);
    if (error) toast.error("Couldn't save — opening WhatsApp instead.");
    else toast.success("Message received. We'll be in touch shortly.");
    const msg = `Hi Hadees Trading,\n\nName: ${form.name}\nEmail: ${form.email}\nTopic: ${form.topic}\n\n${form.message}`;
    window.open(waLink(msg), "_blank", "noopener,noreferrer");
  };

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Contact"
        title="Let's talk about your business."
        description="Our team responds fastest on WhatsApp — usually within minutes during business hours."
      />

      <section className="container-x mt-16 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        {/* Form */}
        <form onSubmit={handleSubmit} className="card-elevated p-8">
          <h2 className="text-xl font-bold">Send us a message</h2>
          <p className="mt-1 text-sm text-muted-foreground">We'll open WhatsApp with your details pre-filled.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Your name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
          </div>
          <div className="mt-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Topic</label>
            <select
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-[color:var(--royal)]"
              required
            >
              <option value="">Select a topic</option>
              <option>Business Registration</option>
              <option>Compliance (SARS / B-BBEE / CIDB)</option>
              <option>Website / Digital Solutions</option>
              <option>Trading Academy</option>
              <option>General enquiry</option>
            </select>
          </div>
          <div className="mt-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={5}
              required
              maxLength={1000}
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-[color:var(--royal)] resize-none"
              placeholder="Tell us a bit about your project..."
            />
          </div>
          <button type="submit" disabled={saving} className="mt-6 inline-flex items-center gap-2 rounded-full gradient-royal px-6 py-3 text-sm font-semibold text-white shadow-elegant hover:opacity-90 disabled:opacity-60 transition">
            {saving ? "Sending…" : "Send via WhatsApp"} <Send className="h-4 w-4" />
          </button>
        </form>

        {/* Sidebar */}
        <div className="space-y-4">
          <a href={waLink()} target="_blank" rel="noopener noreferrer"
             className="block rounded-3xl bg-[color:var(--whatsapp)] text-white p-6 shadow-elegant hover:opacity-95 transition">
            <MessageCircle className="h-6 w-6" />
            <h3 className="mt-3 text-lg font-bold">Chat on WhatsApp</h3>
            <p className="mt-1 text-white/85 text-sm">{WHATSAPP_NUMBER}</p>
            <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">Start chat <ArrowRight className="h-4 w-4" /></p>
          </a>

          <div className="card-elevated p-6">
            <Mail className="h-5 w-5 text-[color:var(--royal)]" />
            <h4 className="mt-3 font-semibold">Email</h4>
            <a href={`mailto:${contactEmail}`} className="mt-1 block text-sm text-muted-foreground hover:text-foreground">{contactEmail}</a>
          </div>

          <div className="card-elevated p-6">
            <Clock className="h-5 w-5 text-[color:var(--royal)]" />
            <h4 className="mt-3 font-semibold">Business hours</h4>
            <ul className="mt-2 text-sm text-muted-foreground space-y-1">
              <li className="flex justify-between"><span>Mon – Fri</span><span>08:00 – 17:00</span></li>
              <li className="flex justify-between"><span>Saturday</span><span>09:00 – 13:00</span></li>
              <li className="flex justify-between"><span>Sunday</span><span>Closed</span></li>
            </ul>
          </div>

          <div className="card-elevated p-6">
            <MapPin className="h-5 w-5 text-[color:var(--royal)]" />
            <h4 className="mt-3 font-semibold">Visit us</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Stand 30065<br />Mahikeng, 2735<br />South Africa
            </p>
          </div>
        </div>
      </section>

      <section className="container-x mt-16 mb-4">
        <div className="rounded-3xl overflow-hidden border border-border bg-[color:var(--surface-2)]">
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border bg-background/60">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-[color:var(--royal)]" />
              <span className="font-semibold">Stand 30065, Mahikeng, 2735, South Africa</span>
            </div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Stand+30065+Mahikeng+2735+South+Africa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[color:var(--royal)] hover:text-[color:var(--navy)]"
            >
              Open in Google Maps
            </a>
          </div>
          <iframe
            title="Hadees Trading — Mahikeng location"
            src="https://www.google.com/maps?q=Mahikeng%2C%202735%2C%20South%20Africa&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full aspect-[16/6] border-0"
          />
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        maxLength={200}
        className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-[color:var(--royal)]"
      />
    </div>
  );
}

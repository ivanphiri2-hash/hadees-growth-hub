import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ArrowRight, Globe, Mail, Server, Search, Palette, Database, Bot, Layers } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { waLink } from "@/lib/company";

export const Route = createFileRoute("/digital-solutions")({
  head: () => ({
    meta: [
      { title: "Digital Solutions — Hadees Trading" },
      { name: "description", content: "Websites, hosting, brand identity, CRMs, client portals, Firebase/Supabase development, and AI automation." },
      { property: "og:title", content: "Digital Solutions — Hadees Trading" },
      { property: "og:url", content: "/digital-solutions" },
    ],
    links: [{ rel: "canonical", href: "/digital-solutions" }],
  }),
  component: DigitalPage,
});

const websitePackages = [
  {
    name: "Starter Website",
    price: "R1500",
    features: ["1–3 pages", "Mobile responsive", "Contact form", "Basic SEO setup", "WhatsApp integration", "1 revision round"],
  },
  {
    name: "Value Website",
    price: "R2500",
    highlighted: true,
    features: ["5–7 pages", "Custom design", "Blog / news section", "Advanced SEO", "Analytics setup", "Business email setup", "2 revision rounds"],
  },
  {
    name: "Premium Website",
    price: "R5500",
    features: ["10+ pages", "Custom illustrations", "CRM / booking integration", "Client portal add-on", "Advanced animations", "Priority support", "Unlimited revisions (30 days)"],
  },
];

const services = [
  { icon: Globe, name: "Landing Pages", desc: "High-converting, single-focus pages." },
  { icon: Layers, name: "Corporate Websites", desc: "Multi-page business presence." },
  { icon: Database, name: "Business Portals", desc: "Custom internal systems." },
  { icon: Server, name: "Client Dashboards", desc: "Secure client-facing platforms." },
  { icon: Database, name: "CRM Systems", desc: "Manage leads and clients." },
  { icon: Server, name: "Hosting & Maintenance", desc: "Reliable uptime and updates." },
  { icon: Search, name: "SEO", desc: "Rank on Google for the right terms." },
  { icon: Mail, name: "Business Email", desc: "Professional email on your domain." },
  { icon: Bot, name: "AI Automation", desc: "Automate repetitive workflows." },
  { icon: Palette, name: "Brand Identity", desc: "Logos, palettes, guidelines." },
];

function DigitalPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Digital Solutions"
        title="Modern web, systems, and automation — built to grow with you."
        description="From your first landing page to a full client portal and CRM — we design, build, host and maintain digital products for South African businesses."
      />

      <section className="container-x mt-16">
        <div className="grid gap-6 lg:grid-cols-3">
          {websitePackages.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-3xl p-8 transition-all duration-300 ${
                p.highlighted
                  ? "bg-[color:var(--navy-deep)] text-white border border-[color:var(--gold)]/40 shadow-elegant scale-[1.02]"
                  : "bg-card border border-border card-elevated-hover"
              }`}
            >
              {p.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full gradient-gold px-3 py-1 text-xs font-semibold text-[color:var(--navy-deep)]">
                  Best value
                </span>
              )}
              <h3 className={`text-2xl font-bold ${p.highlighted ? "text-white" : "text-foreground"}`}>{p.name}</h3>
              <p className={`mt-4 text-4xl font-bold ${p.highlighted ? "text-white" : "text-foreground"}`}>
                {p.price}
                <span className={`ml-1 text-sm font-normal ${p.highlighted ? "text-slate-400" : "text-muted-foreground"}`}>from</span>
              </p>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className={`flex items-start gap-2 text-sm ${p.highlighted ? "text-slate-200" : "text-foreground"}`}>
                    <CheckCircle2 className={`h-4 w-4 mt-0.5 shrink-0 ${p.highlighted ? "text-[color:var(--gold)]" : "text-[color:var(--royal)]"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={waLink(`Hi Hadees Trading, I'd like the ${p.name} package.`)}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-8 flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition ${
                  p.highlighted
                    ? "bg-white text-[color:var(--navy-deep)] hover:bg-white/90"
                    : "gradient-royal text-white hover:opacity-90"
                }`}
              >
                Get started <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x mt-24">
        <h2 className="text-3xl font-bold tracking-tight">Comparison</h2>
        <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
          <table className="w-full text-sm">
            <thead className="bg-[color:var(--surface-2)] text-left">
              <tr>
                <th className="p-4 font-semibold">Feature</th>
                <th className="p-4 font-semibold">Starter</th>
                <th className="p-4 font-semibold">Value</th>
                <th className="p-4 font-semibold">Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["Pages included", "1–3", "5–7", "10+"],
                ["Custom design", "Template-based", "Custom", "Fully custom"],
                ["SEO setup", "Basic", "Advanced", "Advanced + strategy"],
                ["Business email", "—", "✓", "✓"],
                ["CRM / portal", "—", "Add-on", "Included"],
                ["Support", "Email", "Priority email", "Dedicated"],
              ].map((row) => (
                <tr key={row[0]}>
                  {row.map((c, i) => (
                    <td key={i} className={`p-4 ${i === 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="container-x mt-24">
        <h2 className="text-3xl font-bold tracking-tight">Everything we build</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.name} className="card-elevated card-elevated-hover p-6">
              <div className="grid h-10 w-10 place-items-center rounded-xl gradient-royal text-white">
                <s.icon className="h-5 w-5" />
              </div>
              <h4 className="mt-4 font-semibold text-foreground">{s.name}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              <a
                href={waLink(`Hi Hadees Trading, I'd like a quote for ${s.name}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--royal)] hover:text-[color:var(--navy)]"
              >
                Enquire on WhatsApp <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

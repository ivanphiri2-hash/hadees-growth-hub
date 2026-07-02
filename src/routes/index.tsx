import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, ShieldCheck, FileCheck2, Globe, Code2, GraduationCap, CheckCircle2, Sparkles, TrendingUp, Users, Clock } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { waLink } from "@/lib/company";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hadees Trading — Building Businesses. Delivering Digital Solutions." },
      { property: "og:title", content: "Hadees Trading — Building Businesses. Delivering Digital Solutions." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

const trustPoints = [
  { icon: Building2, title: "Business Registration", desc: "CIPC, MOI, Tax & bank-ready docs." },
  { icon: ShieldCheck, title: "Compliance Services", desc: "SARS, B-BBEE, COIDA, NHBRC, CIDB." },
  { icon: FileCheck2, title: "Tender Support", desc: "Documentation, profiles, submissions." },
  { icon: Globe, title: "Digital Solutions", desc: "Websites, hosting, brand identity." },
  { icon: Code2, title: "Website Development", desc: "Landing pages, portals, CRMs." },
  { icon: GraduationCap, title: "Trading Education", desc: "Structured, disciplined learning." },
];

function HomePage() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden gradient-hero text-white">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[color:var(--royal)] blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[color:var(--gold)] blur-3xl opacity-20" />

        <div className="container-x relative pt-24 pb-28 lg:pt-32 lg:pb-40">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-medium text-white/90">
              <Sparkles className="h-3.5 w-3.5 text-[color:var(--gold)]" />
              South Africa's trusted business partner
            </span>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              Building Businesses.{" "}
              <span className="text-gradient-gold">Delivering Digital Solutions.</span>{" "}
              Empowering Growth.
            </h1>
            <p className="mt-6 text-lg text-slate-300 max-w-2xl leading-relaxed">
              HADEES TRADING PTY LTD helps South African entrepreneurs, contractors, professionals and organisations
              establish, grow, and modernise their businesses through registration, compliance, branding, digital
              solutions, and professional education.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={waLink("Hi Hadees Trading, I'd like to get started.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full gradient-gold px-6 py-3.5 text-sm font-semibold text-[color:var(--navy-deep)] shadow-elegant hover:brightness-110 transition"
              >
                Start on WhatsApp <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full glass px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/15 transition"
              >
                Request a Quote
              </Link>
            </div>

            <dl className="mt-14 grid grid-cols-3 gap-6 max-w-xl">
              {[
                { k: "500+", v: "Businesses supported" },
                { k: "12+", v: "Service categories" },
                { k: "24/7", v: "WhatsApp response" },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="text-3xl font-bold text-white">{s.k}</dt>
                  <dd className="text-xs text-slate-400 mt-1">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* TRUST GRID */}
      <section className="container-x -mt-20 relative z-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trustPoints.map((t) => (
            <div key={t.title} className="card-elevated card-elevated-hover p-6">
              <div className="grid h-11 w-11 place-items-center rounded-xl gradient-royal text-white">
                <t.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{t.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DIVISIONS */}
      <section className="container-x mt-28">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--royal)]">Our Divisions</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
            One ecosystem. Three specialised divisions.
          </h2>
          <p className="mt-4 text-muted-foreground">
            From company formation to digital transformation and professional education — we're built to move with you as your business grows.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <DivisionCard
            eyebrow="Business Services"
            title="Establish & stay compliant"
            desc="Company registration, CIPC, SARS, B-BBEE, CIDB, COIDA, NHBRC, tax compliance, business plans, company profiles and tender support."
            items={["Company Registration", "CIPC & SARS", "B-BBEE Certificates", "CIDB & COIDA", "Business Plans", "Tender Support"]}
            cta={{ to: "/business-services", label: "Explore Business Services" }}
            accent="from-[color:var(--royal)] to-[color:var(--royal-soft)]"
          />
          <DivisionCard
            eyebrow="Digital Solutions"
            title="Modern web & business systems"
            desc="Websites, hosting, domains, business email, brand identity, CRMs, client portals, Firebase & Supabase development, and AI automation."
            items={["Website Design", "Hosting & Domains", "Brand Identity", "CRM & Portals", "SEO", "AI Automation"]}
            cta={{ to: "/digital-solutions", label: "Explore Digital Solutions" }}
            accent="from-[color:var(--navy)] to-[color:var(--royal)]"
          />
          <DivisionCard
            eyebrow="Trading Academy"
            title="Learn structure & discipline"
            desc="Practical trading education built on market structure, risk management, psychology and mentorship. Educational content only — not financial advice."
            items={["Trading Education", "Mentorship", "Market Structure", "Risk Management", "Live Workshops", "Student Dashboard"]}
            cta={{ to: "/academy", label: "Explore Academy" }}
            accent="from-[color:var(--gold)] to-orange-500"
            dark
          />
        </div>
      </section>

      {/* WHY US */}
      <section className="container-x mt-28">
        <div className="rounded-3xl gradient-royal p-10 lg:p-16 text-white shadow-elegant overflow-hidden relative">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="relative grid gap-10 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Why South African businesses choose Hadees</h2>
              <p className="mt-4 text-white/85 max-w-lg">
                We combine deep local compliance expertise with modern digital delivery — so you can register, grow, and scale from a single trusted partner.
              </p>
              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[color:var(--navy)] hover:bg-white/90 transition"
              >
                Talk to a specialist <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: TrendingUp, title: "Growth-oriented", desc: "Services designed to scale with you." },
                { icon: ShieldCheck, title: "Fully compliant", desc: "SARS, CIPC, B-BBEE, CIDB expertise." },
                { icon: Users, title: "Client-focused", desc: "Real people. Real responsiveness." },
                { icon: Clock, title: "Fast turnaround", desc: "Most services in days, not weeks." },
              ].map((w) => (
                <div key={w.title} className="glass rounded-2xl p-5">
                  <w.icon className="h-6 w-6 text-[color:var(--gold)]" />
                  <h4 className="mt-3 font-semibold">{w.title}</h4>
                  <p className="text-sm text-white/75 mt-1">{w.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="container-x mt-28">
        <div className="rounded-3xl border border-border bg-card p-10 lg:p-14 text-center shadow-elegant">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Ready to build something serious?</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Chat to our team on WhatsApp and get a personalised quote in minutes.
          </p>
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant hover:opacity-90 transition"
          >
            Start on WhatsApp <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </SiteLayout>
  );
}

function DivisionCard({
  eyebrow,
  title,
  desc,
  items,
  cta,
  accent,
  dark,
}: {
  eyebrow: string;
  title: string;
  desc: string;
  items: string[];
  cta: { to: string; label: string };
  accent: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl p-8 border transition-all duration-300 hover:-translate-y-1 ${
        dark
          ? "bg-[color:var(--navy-deep)] border-white/10 text-white shadow-elegant"
          : "bg-card border-border shadow-[0_10px_40px_-20px_oklch(0.24_0.06_258/0.18)] hover:shadow-elegant"
      }`}
    >
      <div className={`absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br ${accent} opacity-30 blur-2xl`} />
      <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${dark ? "text-[color:var(--gold)]" : "text-[color:var(--royal)]"}`}>
        {eyebrow}
      </p>
      <h3 className={`mt-3 text-2xl font-bold tracking-tight ${dark ? "text-white" : "text-foreground"}`}>{title}</h3>
      <p className={`mt-3 text-sm ${dark ? "text-slate-300" : "text-muted-foreground"}`}>{desc}</p>
      <ul className="mt-6 grid grid-cols-2 gap-2">
        {items.map((i) => (
          <li key={i} className={`flex items-center gap-2 text-sm ${dark ? "text-slate-200" : "text-foreground"}`}>
            <CheckCircle2 className={`h-4 w-4 shrink-0 ${dark ? "text-[color:var(--gold)]" : "text-[color:var(--royal)]"}`} />
            {i}
          </li>
        ))}
      </ul>
      <Link
        to={cta.to}
        className={`mt-8 inline-flex items-center gap-2 text-sm font-semibold ${
          dark ? "text-[color:var(--gold)] hover:text-white" : "text-[color:var(--royal)] hover:text-[color:var(--navy)]"
        } transition`}
      >
        {cta.label} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

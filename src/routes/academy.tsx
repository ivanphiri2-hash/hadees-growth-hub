import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Brain, LineChart, Layers, Waves, CheckCircle2, ArrowRight, ChevronDown, AlertTriangle, Mail } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { waLink } from "@/lib/company";
import { useContactEmail } from "@/hooks/use-app-settings";

export const Route = createFileRoute("/academy")({
  head: () => ({
    meta: [
      { title: "Hadees Trading Academy — Master Trading Through Discipline" },
      { name: "description", content: "Structured trading education based on psychology, market structure, discipline, and consistent execution. Educational content only." },
      { property: "og:title", content: "Hadees Trading Academy" },
      { property: "og:url", content: "/academy" },
    ],
    links: [{ rel: "canonical", href: "/academy" }],
  }),
  component: AcademyPage,
});

const pillars = [
  { icon: Brain, title: "Mindset", desc: "Discipline, patience, emotional control — the foundation of every consistent trader." },
  { icon: LineChart, title: "Narrative", desc: "Understand macro context and why the market moves before you engage." },
  { icon: Layers, title: "Structure", desc: "Read market structure, liquidity and key levels with clarity." },
  { icon: Waves, title: "Rhythm", desc: "Execute a repeatable process — journaling, review, and iteration." },
];

const tiers = [
  {
    name: "Starter",
    price: "R750",
    tag: "Learn the foundations",
    features: ["Core curriculum access", "Community group", "Weekly market breakdowns", "Educational library"],
  },
  {
    name: "Professional",
    price: "R1750",
    tag: "Structured growth",
    highlighted: true,
    features: ["Everything in Starter", "Live weekly workshops", "Trading journal templates", "Zoom Q&A sessions", "Student dashboard"],
  },
  {
    name: "Mentorship",
    price: "R3500",
    tag: "1-on-1 guidance",
    features: ["Everything in Professional", "1:1 mentorship sessions", "Personalised trading plan", "Priority support", "Extended community access"],
  },
];

const faqs = [
  { q: "Is this financial advice?", a: "No. The Academy provides educational content only. We do not manage funds, provide financial advice, or guarantee any results." },
  { q: "Do I need experience?", a: "No prior experience is required. Our curriculum is structured from foundations up to advanced execution." },
  { q: "How is the learning delivered?", a: "Through a mix of on-demand modules, live workshops on Zoom, community discussion and (in Mentorship) 1:1 sessions." },
  { q: "Can I upgrade later?", a: "Yes — you can upgrade to a higher tier at any time. Chat to us on WhatsApp to arrange." },
];

function AcademyPage() {
  const contactEmail = useContactEmail();
  return (
    <SiteLayout>
      {/* Dark hero */}
      <section className="relative overflow-hidden bg-[color:var(--navy-deep)] text-white">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-[color:var(--gold)] blur-3xl opacity-20" />
        <div className="absolute bottom-0 -left-40 h-96 w-96 rounded-full bg-[color:var(--royal)] blur-3xl opacity-30" />
        <div className="container-x relative py-20 lg:py-28">
          <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--gold)]" />
            Hadees Trading Academy
          </span>
          <h1 className="mt-6 text-4xl sm:text-6xl font-bold tracking-tight max-w-3xl leading-[1.05]">
            Master Trading Through <span className="text-gradient-gold">Discipline.</span>
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl leading-relaxed">
            Learn structured trading based on psychology, market structure, discipline and consistent execution — not hype.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={waLink("Hi Hadees Trading, I'd like to join the Academy.")} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 rounded-full gradient-gold px-6 py-3.5 text-sm font-semibold text-[color:var(--navy-deep)] shadow-elegant hover:brightness-110 transition">
              Join the Academy <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#pricing" className="inline-flex items-center gap-2 rounded-full glass px-6 py-3.5 text-sm font-semibold hover:bg-white/15 transition">
              View pricing
            </a>
          </div>
        </div>
      </section>

      {/* Four pillars */}
      <section className="bg-[color:var(--navy)] text-white">
        <div className="container-x py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gold)]">Our approach</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">Four pillars of consistent trading.</h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p) => (
              <div key={p.title} className="glass rounded-2xl p-6 hover:-translate-y-1 transition-transform">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[color:var(--gold)]/15 text-[color:var(--gold)]">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-white">{p.title}</h3>
                <p className="mt-1.5 text-sm text-slate-300">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container-x mt-24">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Choose your path</h2>
          <p className="mt-3 text-muted-foreground">Start with foundations. Level up as you grow.</p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {tiers.map((t) => (
            <div key={t.name} className={`relative rounded-3xl p-8 transition-all duration-300 ${
              t.highlighted
                ? "bg-[color:var(--navy-deep)] text-white border border-[color:var(--gold)]/40 shadow-elegant scale-[1.02]"
                : "bg-card border border-border card-elevated-hover"
            }`}>
              {t.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full gradient-gold px-3 py-1 text-xs font-semibold text-[color:var(--navy-deep)]">Most chosen</span>
              )}
              <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${t.highlighted ? "text-[color:var(--gold)]" : "text-[color:var(--royal)]"}`}>{t.tag}</p>
              <h3 className={`mt-2 text-2xl font-bold ${t.highlighted ? "text-white" : "text-foreground"}`}>{t.name}</h3>
              <p className={`mt-4 text-4xl font-bold ${t.highlighted ? "text-white" : "text-foreground"}`}>
                {t.price}<span className={`ml-1 text-sm font-normal ${t.highlighted ? "text-slate-400" : "text-muted-foreground"}`}>/ month</span>
              </p>
              <ul className="mt-6 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className={`flex items-start gap-2 text-sm ${t.highlighted ? "text-slate-200" : "text-foreground"}`}>
                    <CheckCircle2 className={`h-4 w-4 mt-0.5 shrink-0 ${t.highlighted ? "text-[color:var(--gold)]" : "text-[color:var(--royal)]"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-2">
                <a href={waLink(`Hi Hadees Trading, I'd like the ${t.name} Academy tier.`)} target="_blank" rel="noopener noreferrer"
                   className={`flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition ${
                     t.highlighted ? "bg-white text-[color:var(--navy-deep)] hover:bg-white/90" : "gradient-royal text-white hover:opacity-90"
                   }`}>
                  Enrol via WhatsApp <ArrowRight className="h-4 w-4" />
                </a>
                <a href={`mailto:${contactEmail}?subject=${encodeURIComponent(`Academy enrolment: ${t.name}`)}`}
                   className={`flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition ${
                     t.highlighted ? "border border-white/40 bg-white/10 text-white hover:bg-white/20" : "border border-border bg-background text-foreground hover:bg-muted"
                   }`}>
                  <Mail className="h-4 w-4" /> Email us
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Learning path */}
      <section className="container-x mt-24">
        <div className="rounded-3xl bg-[color:var(--surface-2)] border border-border p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--royal)]">Learning path</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">From foundations to execution</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {["Foundations", "Market Structure", "Risk Management", "Live Execution"].map((step, i) => (
              <div key={step} className="relative bg-card rounded-2xl border border-border p-6 shadow-soft">
                <div className="text-4xl font-bold text-[color:var(--royal)]/25">{String(i + 1).padStart(2, "0")}</div>
                <h4 className="mt-2 font-semibold">{step}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-x mt-24">
        <h2 className="text-3xl font-bold tracking-tight">Frequently asked</h2>
        <div className="mt-8 space-y-3 max-w-3xl">
          {faqs.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="container-x mt-16 mb-4">
        <div className="rounded-2xl border border-[color:var(--gold)]/30 bg-[color:var(--gold)]/5 p-6 flex gap-4">
          <AlertTriangle className="h-5 w-5 text-[color:var(--gold)] shrink-0 mt-0.5" />
          <div className="text-sm text-foreground">
            <p className="font-semibold">Important disclaimer</p>
            <p className="mt-1 text-muted-foreground">
              This academy provides educational content only. No financial advice. No investment management. No guaranteed profits.
              Trading involves substantial risk of loss and is not suitable for every investor.
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between gap-4 p-5 text-left">
        <span className="font-semibold text-foreground">{q}</span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 pb-5 text-sm text-muted-foreground">{a}</div>}
    </div>
  );
}

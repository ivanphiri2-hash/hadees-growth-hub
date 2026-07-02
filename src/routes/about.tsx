import { createFileRoute } from "@tanstack/react-router";
import { Target, Eye, Heart, Award, Users, Zap, Shield } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Hadees Trading" },
      { name: "description", content: "Our mission, vision, values, and story: empowering South African businesses through services, digital innovation, and education." },
      { property: "og:title", content: "About Hadees Trading" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const values = [
  { icon: Award, title: "Professional", desc: "We hold ourselves to a high standard in every engagement." },
  { icon: Shield, title: "Reliable", desc: "We do what we say — on time and on spec." },
  { icon: Zap, title: "Innovative", desc: "We use modern tools to solve real business problems." },
  { icon: Eye, title: "Transparent", desc: "Clear pricing, clear scope, clear communication." },
  { icon: Target, title: "Growth-oriented", desc: "Every service is designed to help you scale." },
  { icon: Heart, title: "Customer-focused", desc: "Your outcomes drive everything we build." },
];

const timeline = [
  { year: "Founded", title: "Hadees Trading established", desc: "Started supporting local entrepreneurs with registration and compliance." },
  { year: "Expansion", title: "Digital Solutions launched", desc: "Added websites, hosting, brand identity and business systems." },
  { year: "Education", title: "Hadees Trading Academy", desc: "Introduced structured trading education for aspiring traders." },
  { year: "Today", title: "Full ecosystem", desc: "Serving businesses across South Africa with one unified platform." },
];

function AboutPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="About Us"
        title="Empowering South African businesses to establish, grow, and modernise."
        description="Hadees Trading PTY LTD combines business services, digital solutions and professional education under one trusted brand."
      />

      {/* Mission / Vision */}
      <section className="container-x mt-16 grid gap-6 lg:grid-cols-2">
        <div className="card-elevated p-8">
          <div className="grid h-11 w-11 place-items-center rounded-xl gradient-royal text-white">
            <Target className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-xl font-bold">Our mission</h3>
          <p className="mt-2 text-muted-foreground">
            Empowering entrepreneurs and businesses through professional business solutions, digital innovation, compliance support, and practical education.
          </p>
        </div>
        <div className="card-elevated p-8">
          <div className="grid h-11 w-11 place-items-center rounded-xl gradient-gold text-[color:var(--navy-deep)]">
            <Eye className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-xl font-bold">Our vision</h3>
          <p className="mt-2 text-muted-foreground">
            To become one of South Africa's most trusted providers of business services, digital solutions and professional education — through technology-driven systems and exceptional service.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="container-x mt-20">
        <h2 className="text-3xl font-bold tracking-tight">Our values</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="card-elevated card-elevated-hover p-6">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[color:var(--royal)]/10 text-[color:var(--royal)]">
                <v.icon className="h-5 w-5" />
              </div>
              <h4 className="mt-4 font-semibold">{v.title}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="container-x mt-20">
        <h2 className="text-3xl font-bold tracking-tight">Our journey</h2>
        <div className="mt-10 relative">
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-10">
            {timeline.map((t, i) => (
              <div key={t.title} className={`relative flex items-start gap-6 sm:grid sm:grid-cols-2 sm:gap-10 ${i % 2 === 1 ? "sm:[&>div]:col-start-2" : ""}`}>
                <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 mt-2 grid h-3 w-3 place-items-center rounded-full bg-[color:var(--royal)] ring-4 ring-background" />
                <div className="pl-12 sm:pl-0 sm:pr-10">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gold)]">{t.year}</p>
                  <h4 className="mt-1 font-semibold text-foreground">{t.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="container-x mt-20 mb-8">
        <div className="rounded-3xl bg-[color:var(--surface-2)] border border-border p-10 grid gap-8 lg:grid-cols-[1fr_auto] items-center">
          <div>
            <h3 className="text-2xl font-bold">Why choose Hadees</h3>
            <p className="mt-3 text-muted-foreground max-w-xl">
              One trusted partner for registration, compliance, digital solutions and education — with WhatsApp-first support and transparent pricing.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-[color:var(--royal)]" />
            <span className="text-sm font-semibold">Trusted by 500+ South African entrepreneurs</span>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

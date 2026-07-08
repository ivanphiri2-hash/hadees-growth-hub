import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ArrowRight, Sparkles, Mail } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { waLink } from "@/lib/company";
import { PageHero } from "@/components/page-hero";
import { useContactEmail } from "@/hooks/use-app-settings";

export const Route = createFileRoute("/business-services")({
  head: () => ({
    meta: [
      { title: "Business Services — Hadees Trading" },
      { name: "description", content: "Company registration, CIPC, SARS, B-BBEE, CIDB, COIDA, NHBRC, tax compliance, business plans, tender support and more." },
      { property: "og:title", content: "Business Services — Hadees Trading" },
      { property: "og:url", content: "/business-services" },
    ],
    links: [{ rel: "canonical", href: "/business-services" }],
  }),
  component: BusinessServicesPage,
});

const packages = [
  {
    name: "Basic",
    price: "R600",
    tag: "Get started",
    features: ["CIPC Registration", "MOI Document", "Tax Number", "B-BBEE Affidavit", "Bank Letter", "Email delivery"],
  },
  {
    name: "Value",
    price: "R1000",
    tag: "Most popular",
    highlighted: true,
    features: [
      "Everything in Basic",
      "Beneficial Ownership",
      "Company Profile (basic)",
      "Share Certificate",
      "Priority processing",
    ],
  },
  {
    name: "Professional",
    price: "R2500",
    tag: "Full-stack",
    features: [
      "Everything in Value",
      "Professional Company Profile",
      "Logo Design",
      "Letterhead + Invoice template",
      "Tax Clearance application",
      "Dedicated consultant",
    ],
  },
];

const additional = [
  { name: "COIDA Registration", price: "R3,500" },
  { name: "NHBRC Registration", price: "R4,500" },
  { name: "NHBRC Assistance", price: "R500" },
  { name: "CIDB Application", price: "From R1,200" },
  { name: "Tax Clearance Assistance", price: "R350" },
  { name: "B-BBEE Registration", price: "R350" },
  { name: "Annual Returns", price: "From R350" },
  { name: "Business Plan", price: "R500" },
  { name: "Company Profiles", price: "From R750" },
  { name: "Tender Document Review", price: "R500" },
  { name: "Share Certificate", price: "R350" },
  { name: "Letterhead & Logo Design", price: "R500" },
  { name: "Invoice & Quotation Template", price: "R400" },
];

function BusinessServicesPage() {
  const contactEmail = useContactEmail();
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Business Services"
        title="Register, comply, and stay ahead."
        description="From CIPC registration to CIDB, SARS and B-BBEE — everything you need to run a compliant, professional business in South Africa."
      />

      {/* Packages */}
      <section className="container-x mt-16">
        <div className="grid gap-6 lg:grid-cols-3">
          {packages.map((p) => (
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
                  Most popular
                </span>
              )}
              <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${p.highlighted ? "text-[color:var(--gold)]" : "text-[color:var(--royal)]"}`}>
                {p.tag}
              </p>
              <h3 className={`mt-2 text-2xl font-bold ${p.highlighted ? "text-white" : "text-foreground"}`}>{p.name}</h3>
              <p className={`mt-4 text-4xl font-bold ${p.highlighted ? "text-white" : "text-foreground"}`}>
                {p.price}
                <span className={`ml-1 text-sm font-normal ${p.highlighted ? "text-slate-400" : "text-muted-foreground"}`}>once-off</span>
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
                href={waLink(`Hi Hadees Trading, I'd like the ${p.name} registration package.`)}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-8 flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition ${
                  p.highlighted
                    ? "bg-white text-[color:var(--navy-deep)] hover:bg-white/90"
                    : "gradient-royal text-white hover:opacity-90"
                }`}
              >
                Apply via WhatsApp <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Additional services */}
      <section className="container-x mt-24">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--royal)]">Additional Services</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">Everything else your business needs</h2>
          <p className="mt-3 text-muted-foreground font-medium">Individual services are available on request. Enquire via WhatsApp or Email for a personalised quotation.</p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {additional.map((s) => (
            <div key={s.name} className="card-elevated card-elevated-hover p-5 flex flex-col gap-3">
              <div>
                <h4 className="font-semibold text-foreground">{s.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{s.price}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={waLink(`Hi Hadees Trading, I'd like to enquire about ${s.name}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--navy)] px-3.5 py-2 text-xs font-semibold text-white hover:opacity-90 transition"
                >
                  WhatsApp <ArrowRight className="h-3.5 w-3.5" />
                </a>
                <a
                  href={`mailto:${contactEmail}?subject=${encodeURIComponent(`Enquiry: ${s.name}`)}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
                >
                  <Mail className="h-3.5 w-3.5" /> Email
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x mt-24">
        <div className="rounded-3xl gradient-royal p-10 text-white text-center shadow-elegant">
          <Sparkles className="h-6 w-6 mx-auto text-[color:var(--gold)]" />
          <h3 className="mt-4 text-2xl font-bold">Not sure which package fits?</h3>
          <p className="mt-2 text-white/85">Send us a message — we'll recommend the right path for your business.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[color:var(--navy)] hover:bg-white/90 transition"
            >
              Chat on WhatsApp <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={`mailto:${contactEmail}?subject=${encodeURIComponent("Business services enquiry")}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 backdrop-blur px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition"
            >
              <Mail className="h-4 w-4" /> Email us
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, BookOpen, FileText, Video, Download, HelpCircle, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";

export const Route = createFileRoute("/knowledge-hub")({
  head: () => ({
    meta: [
      { title: "Knowledge Hub — Hadees Trading" },
      { name: "description", content: "Business articles, compliance guides, tender resources, digital marketing tips, and trading education." },
      { property: "og:title", content: "Knowledge Hub — Hadees Trading" },
      { property: "og:url", content: "/knowledge-hub" },
    ],
    links: [{ rel: "canonical", href: "/knowledge-hub" }],
  }),
  component: KnowledgeHub,
});

const categories = [
  { icon: BookOpen, name: "Business Articles", count: 24 },
  { icon: FileText, name: "Compliance Guides", count: 18 },
  { icon: FileText, name: "Tender Resources", count: 12 },
  { icon: BookOpen, name: "Digital Marketing", count: 15 },
  { icon: BookOpen, name: "Website Development", count: 9 },
  { icon: BookOpen, name: "Trading Education", count: 21 },
  { icon: Download, name: "Downloads", count: 8 },
  { icon: Video, name: "Videos", count: 14 },
  { icon: HelpCircle, name: "FAQs", count: 30 },
];

const featured = [
  { tag: "Business", title: "How to register a company in South Africa in 2025", excerpt: "A step-by-step guide covering CIPC, MOI, tax number, and B-BBEE affidavit." },
  { tag: "Compliance", title: "Understanding B-BBEE for small businesses", excerpt: "What EMEs and QSEs need to know — and how to get compliant fast." },
  { tag: "Digital", title: "Choosing the right website package for your business", excerpt: "Starter vs Value vs Premium — a practical breakdown." },
];

function KnowledgeHub() {
  const [q, setQ] = useState("");
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Knowledge Hub"
        title="Learn, apply, and grow."
        description="Practical resources for South African entrepreneurs — from compliance to digital marketing and trading education."
      >
        <div className="mt-8 max-w-xl">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-3 shadow-soft">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search articles, guides, downloads..."
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </PageHero>

      <section className="container-x mt-16">
        <h2 className="text-2xl font-bold tracking-tight">Browse by category</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c.name} className="card-elevated card-elevated-hover p-5 flex items-center gap-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl gradient-royal text-white">
                <c.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{c.name}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{c.count} resources</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </section>

      <section className="container-x mt-20">
        <h2 className="text-2xl font-bold tracking-tight">Featured articles</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {featured.map((f) => (
            <article key={f.title} className="card-elevated card-elevated-hover overflow-hidden">
              <div className="h-40 gradient-royal" />
              <div className="p-6">
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--royal)]">{f.tag}</span>
                <h3 className="mt-2 font-semibold text-lg leading-snug text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.excerpt}</p>
                <a href="#" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--royal)]">
                  Read article <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container-x mt-24">
        <div className="rounded-3xl bg-[color:var(--navy-deep)] text-white p-10 lg:p-14 shadow-elegant relative overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="relative max-w-2xl">
            <h3 className="text-2xl sm:text-3xl font-bold">Get the Hadees newsletter</h3>
            <p className="mt-2 text-slate-300">Practical business, compliance and digital insights — straight to your inbox, once a month.</p>
            <form className="mt-6 flex flex-col sm:flex-row gap-3">
              <input type="email" required placeholder="you@business.co.za"
                className="flex-1 rounded-full px-5 py-3 text-sm bg-white/10 border border-white/20 text-white placeholder:text-slate-400 outline-none focus:border-[color:var(--gold)]" />
              <button type="submit" className="rounded-full gradient-gold px-6 py-3 text-sm font-semibold text-[color:var(--navy-deep)] hover:brightness-110 transition">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

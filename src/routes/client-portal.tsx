import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { waLink } from "@/lib/company";

export const Route = createFileRoute("/client-portal")({
  head: () => ({
    meta: [
      { title: "Client Portal — Hadees Trading" },
      { name: "description", content: "Secure client area — coming soon. View orders, track progress, download documents." },
      { property: "og:title", content: "Client Portal — Hadees Trading" },
      { property: "og:url", content: "/client-portal" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/client-portal" }],
  }),
  component: PortalPage,
});

const features = [
  "View Orders", "Track Progress", "Upload Documents", "Download Certificates",
  "Download Invoices", "View Quotes", "Book Meetings", "Access Purchased Courses",
  "Manage Profile", "Receive Notifications",
];

function PortalPage() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Client Portal" title="Your secure client area — launching soon." description="Manage everything you do with Hadees Trading in one place." />

      <section className="container-x mt-16">
        <div className="rounded-3xl bg-[color:var(--navy-deep)] text-white p-10 lg:p-16 shadow-elegant relative overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_1.2fr] items-center">
            <div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-gold text-[color:var(--navy-deep)]">
                <Lock className="h-6 w-6" />
              </div>
              <h2 className="mt-6 text-3xl font-bold">Coming soon</h2>
              <p className="mt-3 text-slate-300 max-w-md">
                We're building a secure portal with authentication and role-based access. In the meantime, chat to us on WhatsApp and we'll handle everything personally.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={waLink()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full gradient-gold px-5 py-3 text-sm font-semibold text-[color:var(--navy-deep)] hover:brightness-110 transition">
                  Contact us <ArrowRight className="h-4 w-4" />
                </a>
                <Link to="/contact" className="inline-flex items-center gap-2 rounded-full glass px-5 py-3 text-sm font-semibold hover:bg-white/15 transition">
                  Request updates
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {features.map((f) => (
                <div key={f} className="glass rounded-xl p-3 text-sm text-white/90">{f}</div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

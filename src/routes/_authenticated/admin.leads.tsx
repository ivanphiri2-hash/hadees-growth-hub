import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { useAuth, useRoles } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  service_interest: string | null;
  message: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

const STAGES = ["new", "contacted", "qualified", "won", "lost"] as const;

export const Route = createFileRoute("/_authenticated/admin/leads")({
  head: () => ({ meta: [{ title: "Admin · Leads — Hadees Trading" }, { name: "robots", content: "noindex" }] }),
  component: AdminLeadsPage,
});

function AdminLeadsPage() {
  const { user } = useAuth();
  const { isStaff, loading } = useRoles(user);
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    if (!loading && !isStaff) { toast.error("Staff access required"); navigate({ to: "/portal", replace: true }); }
  }, [loading, isStaff]);

  useEffect(() => {
    if (!isStaff) return;
    supabase.from("leads").select("*").order("created_at", { ascending: false }).then(({ data, error }) => {
      if (error) return toast.error(error.message);
      setLeads(data as Lead[]);
    });
  }, [isStaff]);

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  }

  return (
    <SiteLayout>
      <PageHero eyebrow="CRM" title="Leads Pipeline" description="Track every enquiry from first touch to won client." />
      <section className="container-x mt-10 mb-20">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {STAGES.map((stage) => {
            const items = leads.filter((l) => l.status === stage);
            return (
              <div key={stage} className="rounded-2xl border border-border bg-[color:var(--surface-2)] p-3">
                <div className="flex items-center justify-between mb-2 px-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider">{stage}</h3>
                  <span className="text-xs text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((l) => (
                    <div key={l.id} className="rounded-xl bg-background border border-border p-3 shadow-sm">
                      <p className="font-semibold text-sm">{l.name}</p>
                      {l.email && <p className="text-xs text-muted-foreground truncate">{l.email}</p>}
                      {l.phone && <p className="text-xs text-muted-foreground">{l.phone}</p>}
                      {l.service_interest && <p className="mt-1 text-xs"><span className="inline-block rounded-full bg-muted px-2 py-0.5">{l.service_interest}</span></p>}
                      {l.message && <p className="mt-2 text-xs text-muted-foreground line-clamp-3">{l.message}</p>}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {STAGES.filter((s) => s !== l.status).map((s) => (
                          <button key={s} onClick={() => updateStatus(l.id, s)}
                            className="text-[10px] rounded-full border border-border px-2 py-0.5 hover:bg-muted transition">→ {s}</button>
                        ))}
                      </div>
                      <p className="mt-2 text-[10px] text-muted-foreground">{new Date(l.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                  {items.length === 0 && <p className="text-xs text-muted-foreground px-1 py-4 text-center">No leads</p>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-8"><Button variant="outline" onClick={() => navigate({ to: "/portal" })}>Back to Portal</Button></div>
      </section>
    </SiteLayout>
  );
}

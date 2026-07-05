import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { useAuth, useRoles } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

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
type Stage = (typeof STAGES)[number];

export const Route = createFileRoute("/_authenticated/admin/leads")({
  head: () => ({ meta: [{ title: "Admin · Leads — Hadees Trading" }, { name: "robots", content: "noindex" }] }),
  component: AdminLeadsPage,
});

function AdminLeadsPage() {
  const { user } = useAuth();
  const { isStaff, loading } = useRoles(user);
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [query, setQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<"all" | "7" | "30" | "90">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

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

  const sources = useMemo(() => Array.from(new Set(leads.map((l) => l.source).filter(Boolean))) as string[], [leads]);
  const services = useMemo(() => Array.from(new Set(leads.map((l) => l.service_interest).filter(Boolean))) as string[], [leads]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cutoff = dateFilter === "all" ? 0 : Date.now() - Number(dateFilter) * 86400000;
    return leads.filter((l) => {
      if (sourceFilter !== "all" && l.source !== sourceFilter) return false;
      if (serviceFilter !== "all" && l.service_interest !== serviceFilter) return false;
      if (cutoff && new Date(l.created_at).getTime() < cutoff) return false;
      if (!q) return true;
      return [l.name, l.email, l.phone, l.message, l.notes, l.service_interest, l.source]
        .some((v) => v?.toLowerCase().includes(q));
    });
  }, [leads, query, sourceFilter, serviceFilter, dateFilter]);

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  }

  async function bulkMove(status: Stage) {
    const ids = Array.from(selected);
    if (ids.length === 0) return toast.info("No leads selected");
    const { error } = await supabase.from("leads").update({ status }).in("id", ids);
    if (error) return toast.error(error.message);
    setLeads((prev) => prev.map((l) => (ids.includes(l.id) ? { ...l, status } : l)));
    toast.success(`Moved ${ids.length} lead${ids.length > 1 ? "s" : ""} to ${status}`);
    setSelected(new Set());
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function selectAllInStage(stage: Stage) {
    const ids = filtered.filter((l) => l.status === stage).map((l) => l.id);
    setSelected((prev) => {
      const next = new Set(prev);
      const allSelected = ids.every((id) => next.has(id));
      if (allSelected) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  }

  function clearFilters() {
    setQuery(""); setSourceFilter("all"); setServiceFilter("all"); setDateFilter("all");
  }

  const activeFilters = query || sourceFilter !== "all" || serviceFilter !== "all" || dateFilter !== "all";

  return (
    <SiteLayout>
      <PageHero eyebrow="CRM" title="Leads Pipeline" description="Track every enquiry from first touch to won client." />
      <section className="container-x mt-8 mb-20">
        {/* Filters */}
        <div className="rounded-2xl border border-border bg-[color:var(--surface-2)] p-4 mb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email, phone, message…"
                className="pl-9"
              />
            </div>
            <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="all">All sources</option>
              {sources.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="all">All services</option>
              {services.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="all">All time</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            {activeFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-3.5 w-3.5" /> Clear
              </Button>
            )}
            <div className="ml-auto text-xs text-muted-foreground">
              {filtered.length} of {leads.length} leads
            </div>
          </div>

          {/* Bulk actions */}
          {selected.size > 0 && (
            <div className="mt-3 pt-3 border-t border-border flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold">{selected.size} selected · move to:</span>
              {STAGES.map((s) => (
                <button key={s} onClick={() => bulkMove(s)}
                  className="text-xs rounded-full border border-border bg-background px-3 py-1 font-medium hover:bg-muted transition capitalize">
                  {s}
                </button>
              ))}
              <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Deselect</Button>
            </div>
          )}
        </div>

        {/* Pipeline */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {STAGES.map((stage) => {
            const items = filtered.filter((l) => l.status === stage);
            const allSelectedInStage = items.length > 0 && items.every((l) => selected.has(l.id));
            return (
              <div key={stage} className="rounded-2xl border border-border bg-[color:var(--surface-2)] p-3">
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-2">
                    {items.length > 0 && (
                      <Checkbox
                        checked={allSelectedInStage}
                        onCheckedChange={() => selectAllInStage(stage)}
                        aria-label={`Select all in ${stage}`}
                      />
                    )}
                    <h3 className="text-xs font-bold uppercase tracking-wider">{stage}</h3>
                  </div>
                  <span className="text-xs text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((l) => {
                    const isSel = selected.has(l.id);
                    return (
                      <div key={l.id} className={`rounded-xl bg-background border p-3 shadow-sm transition ${isSel ? "border-primary ring-1 ring-primary" : "border-border"}`}>
                        <div className="flex items-start gap-2">
                          <Checkbox checked={isSel} onCheckedChange={() => toggle(l.id)} aria-label="Select lead" />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm truncate">{l.name}</p>
                            {l.email && <p className="text-xs text-muted-foreground truncate">{l.email}</p>}
                            {l.phone && <p className="text-xs text-muted-foreground">{l.phone}</p>}
                            {l.service_interest && <p className="mt-1 text-xs"><span className="inline-block rounded-full bg-muted px-2 py-0.5">{l.service_interest}</span></p>}
                            {l.source && <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">via {l.source}</p>}
                            {l.message && <p className="mt-2 text-xs text-muted-foreground line-clamp-3">{l.message}</p>}
                            <div className="mt-2 flex flex-wrap gap-1">
                              {STAGES.filter((s) => s !== l.status).map((s) => (
                                <button key={s} onClick={() => updateStatus(l.id, s)}
                                  className="text-[10px] rounded-full border border-border px-2 py-0.5 hover:bg-muted transition">→ {s}</button>
                              ))}
                            </div>
                            <p className="mt-2 text-[10px] text-muted-foreground">{new Date(l.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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

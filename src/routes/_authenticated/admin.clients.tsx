import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Upload, FileText, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { useAuth, useRoles } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Client = { id: string; user_id: string | null; company: string | null; industry: string | null; status: string; notes: string | null };
type Order = { id: string; client_id: string; title: string; description: string | null; amount_cents: number; currency: string; status: string };
type Doc = { id: string; client_id: string | null; name: string; storage_path: string; mime: string | null };
type ProfileLite = { id: string; full_name: string | null };

export const Route = createFileRoute("/_authenticated/admin/clients")({
  head: () => ({ meta: [{ title: "Admin · Clients — Hadees Trading" }, { name: "robots", content: "noindex" }] }),
  component: AdminClientsPage,
});

function AdminClientsPage() {
  const { user } = useAuth();
  const { isStaff, loading } = useRoles(user);
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileLite>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [newCompany, setNewCompany] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newOrder, setNewOrder] = useState({ title: "", amount: "", description: "" });

  useEffect(() => {
    if (!loading && !isStaff) { toast.error("Staff access required"); navigate({ to: "/portal", replace: true }); }
  }, [loading, isStaff]);

  async function loadAll() {
    const { data: cs } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    setClients((cs ?? []) as Client[]);
    const { data: ps } = await supabase.from("profiles").select("id, full_name");
    setProfiles(Object.fromEntries((ps ?? []).map((p) => [p.id, p as ProfileLite])));
  }
  useEffect(() => { if (isStaff) loadAll(); }, [isStaff]);

  useEffect(() => {
    if (!selected) { setOrders([]); setDocs([]); return; }
    supabase.from("orders").select("*").eq("client_id", selected).order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data ?? []) as Order[]));
    supabase.from("documents").select("*").eq("client_id", selected).order("created_at", { ascending: false })
      .then(({ data }) => setDocs((data ?? []) as Doc[]));
  }, [selected]);

  async function createClient() {
    if (!newCompany.trim()) return toast.error("Company name required");
    const { error } = await supabase.from("clients").insert({ company: newCompany.trim(), status: "active" });
    if (error) return toast.error(error.message);
    setNewCompany(""); toast.success("Client created"); loadAll();
  }

  async function linkUserByEmail(clientId: string) {
    if (!newUserEmail.trim()) return toast.error("Enter a user email");
    const { data: p } = await supabase.from("profiles").select("id").limit(1);
    // We can't query auth.users from client; use RPC-less approach: look up profile via full_name/email is not available.
    // Simpler: ask admin to paste the user's UUID.
    toast.info("Ask the client to sign up, then paste their user ID in the User ID field below.");
    void p;
  }

  async function setUserId(clientId: string, userId: string) {
    const { error } = await supabase.from("clients").update({ user_id: userId || null }).eq("id", clientId);
    if (error) return toast.error(error.message);
    toast.success("Client linked"); loadAll();
  }

  async function addOrder() {
    if (!selected) return;
    if (!newOrder.title.trim()) return toast.error("Title required");
    const amount = Math.round(parseFloat(newOrder.amount || "0") * 100);
    const { error } = await supabase.from("orders").insert({
      client_id: selected,
      title: newOrder.title.trim(),
      description: newOrder.description || null,
      amount_cents: amount,
      currency: "ZAR",
      status: "draft",
    });
    if (error) return toast.error(error.message);
    setNewOrder({ title: "", amount: "", description: "" });
    supabase.from("orders").select("*").eq("client_id", selected).order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data ?? []) as Order[]));
  }

  async function uploadDoc(file: File) {
    if (!selected) return;
    const path = `${selected}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("documents").upload(path, file);
    if (upErr) return toast.error(upErr.message);
    const { error } = await supabase.from("documents").insert({
      client_id: selected, name: file.name, storage_path: path, mime: file.type, size_bytes: file.size, uploaded_by: user?.id ?? null,
    });
    if (error) return toast.error(error.message);
    toast.success("Uploaded");
    supabase.from("documents").select("*").eq("client_id", selected).order("created_at", { ascending: false })
      .then(({ data }) => setDocs((data ?? []) as Doc[]));
  }

  async function downloadDoc(d: Doc) {
    const { data, error } = await supabase.storage.from("documents").createSignedUrl(d.storage_path, 300);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function deleteDoc(d: Doc) {
    await supabase.storage.from("documents").remove([d.storage_path]);
    await supabase.from("documents").delete().eq("id", d.id);
    setDocs((p) => p.filter((x) => x.id !== d.id));
  }

  const active = clients.find((c) => c.id === selected);

  return (
    <SiteLayout>
      <PageHero eyebrow="CRM" title="Clients, Orders & Documents" description="Manage active client accounts, orders, and files." />
      <section className="container-x mt-10 mb-20 grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="card-elevated p-4 h-fit">
          <h3 className="text-sm font-bold mb-3">All Clients</h3>
          <div className="space-y-1 max-h-[420px] overflow-y-auto">
            {clients.map((c) => (
              <button key={c.id} onClick={() => setSelected(c.id)}
                className={`w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-muted transition ${selected === c.id ? "bg-muted font-semibold" : ""}`}>
                {c.company || "(no name)"}
                {c.user_id && <span className="ml-1 text-[10px] text-[color:var(--royal)]">•linked</span>}
              </button>
            ))}
            {clients.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">No clients yet</p>}
          </div>
          <div className="mt-4 pt-4 border-t border-border space-y-2">
            <Label>New client company</Label>
            <Input value={newCompany} onChange={(e) => setNewCompany(e.target.value)} placeholder="Acme (Pty) Ltd" />
            <Button onClick={createClient} className="w-full"><Plus className="h-4 w-4" />Add</Button>
          </div>
        </aside>

        <div className="space-y-6">
          {!active && <div className="card-elevated p-10 text-center text-sm text-muted-foreground">Select a client to view orders and documents.</div>}
          {active && (
            <>
              <div className="card-elevated p-6">
                <h2 className="text-xl font-bold">{active.company}</h2>
                <p className="text-xs text-muted-foreground mt-1">Status: {active.status} · {active.user_id ? `Linked user: ${profiles[active.user_id]?.full_name || active.user_id.slice(0, 8)}` : "Not linked to a signed-up user"}</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
                  <Input placeholder="Link to user ID (get from Supabase auth after signup)" defaultValue={active.user_id || ""}
                    onBlur={(e) => e.target.value !== (active.user_id || "") && setUserId(active.id, e.target.value)} />
                  <Button variant="outline" onClick={() => linkUserByEmail(active.id)}>How?</Button>
                </div>
              </div>

              <div className="card-elevated p-6">
                <h3 className="text-lg font-bold">Orders</h3>
                <div className="mt-3 space-y-2">
                  {orders.map((o) => (
                    <div key={o.id} className="rounded-xl border border-border p-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm">{o.title}</p>
                        {o.description && <p className="text-xs text-muted-foreground">{o.description}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono">R {(o.amount_cents / 100).toFixed(2)}</span>
                        <span className="text-xs rounded-full bg-muted px-2 py-0.5">{o.status}</span>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && <p className="text-xs text-muted-foreground">No orders yet.</p>}
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_140px_auto]">
                  <Input placeholder="Order title" value={newOrder.title} onChange={(e) => setNewOrder({ ...newOrder, title: e.target.value })} />
                  <Input placeholder="Amount (ZAR)" type="number" step="0.01" value={newOrder.amount} onChange={(e) => setNewOrder({ ...newOrder, amount: e.target.value })} />
                  <Button onClick={addOrder}><Plus className="h-4 w-4" />Add order</Button>
                </div>
              </div>

              <div className="card-elevated p-6">
                <h3 className="text-lg font-bold">Documents</h3>
                <div className="mt-3 space-y-2">
                  {docs.map((d) => (
                    <div key={d.id} className="rounded-xl border border-border p-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-[color:var(--royal)] shrink-0" />
                        <span className="text-sm truncate">{d.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => downloadDoc(d)}>Download</Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteDoc(d)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                  {docs.length === 0 && <p className="text-xs text-muted-foreground">No documents yet.</p>}
                </div>
                <label className="mt-4 inline-flex items-center gap-2 rounded-full border border-dashed border-border px-4 py-3 text-sm cursor-pointer hover:bg-muted transition">
                  <Upload className="h-4 w-4" /> Upload file
                  <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && uploadDoc(e.target.files[0])} />
                </label>
              </div>
            </>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

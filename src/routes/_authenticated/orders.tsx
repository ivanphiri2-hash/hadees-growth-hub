import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { waLink } from "@/lib/company";
import { createPayfastPayment } from "@/lib/payfast.functions";

type Order = { id: string; title: string; description: string | null; amount_cents: number; currency: string; status: string; due_date: string | null };
type Doc = { id: string; name: string; storage_path: string; created_at: string };

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({ meta: [{ title: "My Orders — Hadees Trading" }, { name: "robots", content: "noindex" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ payment: (s.payment as string) ?? undefined }),
  component: MyOrdersPage,
});

function MyOrdersPage() {
  const { user } = useAuth();
  const search = useSearch({ from: "/_authenticated/orders" });
  const startPayfast = useServerFn(createPayfastPayment);
  const [orders, setOrders] = useState<Order[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [hasClient, setHasClient] = useState<boolean | null>(null);
  const [paying, setPaying] = useState<string | null>(null);

  useEffect(() => {
    if (search.payment === "success") toast.success("Payment received — updating your order shortly.");
    if (search.payment === "cancelled") toast.info("Payment cancelled.");
  }, [search.payment]);

  async function pay(orderId: string) {
    setPaying(orderId);
    try {
      const { action, fields } = await startPayfast({ data: { orderId } });
      const form = document.createElement("form");
      form.method = "POST";
      form.action = action;
      for (const [k, v] of Object.entries(fields)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = k;
        input.value = String(v);
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start payment");
      setPaying(null);
    }
  }

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: c } = await supabase.from("clients").select("id").eq("user_id", user.id).maybeSingle();
      if (!c) { setHasClient(false); return; }
      setHasClient(true);
      const { data: os } = await supabase.from("orders").select("*").eq("client_id", c.id).order("created_at", { ascending: false });
      setOrders((os ?? []) as Order[]);
      const { data: ds } = await supabase.from("documents").select("id,name,storage_path,created_at").eq("client_id", c.id).order("created_at", { ascending: false });
      setDocs((ds ?? []) as Doc[]);
    })();
  }, [user?.id]);

  async function download(d: Doc) {
    const { data, error } = await supabase.storage.from("documents").createSignedUrl(d.storage_path, 300);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <SiteLayout>
      <PageHero eyebrow="Portal" title="My Orders & Documents" description="Track your engagements and download shared files." />
      <section className="container-x mt-10 mb-20 space-y-6">
        {hasClient === false && (
          <div className="card-elevated p-8 text-center">
            <p className="text-sm text-muted-foreground">You don't have a client record yet. Our team will link your account after your first engagement.</p>
            <a href={waLink("Hi, please link my client account.")} target="_blank" rel="noopener noreferrer"
              className="mt-4 inline-flex rounded-full gradient-royal px-5 py-2.5 text-sm font-semibold text-white">Contact us</a>
          </div>
        )}
        {hasClient && (
          <>
            <div className="card-elevated p-6">
              <h3 className="text-lg font-bold">Orders</h3>
              <div className="mt-3 space-y-2">
                {orders.map((o) => (
                  <div key={o.id} className="rounded-xl border border-border p-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{o.title}</p>
                      {o.description && <p className="text-xs text-muted-foreground mt-1">{o.description}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm">{o.currency} {(o.amount_cents / 100).toFixed(2)}</span>
                      <span className="text-xs rounded-full bg-muted px-2 py-0.5">{o.status}</span>
                      {o.status !== "paid" && (
                        <Button size="sm" disabled={paying === o.id} onClick={() => pay(o.id)}>{paying === o.id ? "Redirecting…" : "Pay with PayFast"}</Button>
                      )}
                    </div>
                  </div>
                ))}
                {orders.length === 0 && <p className="text-xs text-muted-foreground">No orders yet.</p>}
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
                    <Button variant="outline" size="sm" onClick={() => download(d)}>Download</Button>
                  </div>
                ))}
                {docs.length === 0 && <p className="text-xs text-muted-foreground">No documents shared yet.</p>}
              </div>
            </div>
          </>
        )}
      </section>
    </SiteLayout>
  );
}

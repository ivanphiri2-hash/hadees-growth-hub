import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { useAuth, useRoles } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Booking = {
  id: string; name: string; email: string; phone: string | null;
  service: string | null; requested_at: string; status: string; notes: string | null; created_at: string;
};

const STATUSES = ["pending", "confirmed", "completed", "cancelled"];

export const Route = createFileRoute("/_authenticated/admin/bookings")({
  head: () => ({ meta: [{ title: "Admin · Bookings — Hadees Trading" }, { name: "robots", content: "noindex" }] }),
  component: AdminBookingsPage,
});

function AdminBookingsPage() {
  const { user } = useAuth();
  const { isStaff, loading } = useRoles(user);
  const navigate = useNavigate();
  const [rows, setRows] = useState<Booking[]>([]);

  useEffect(() => {
    if (!loading && !isStaff) { toast.error("Staff access required"); navigate({ to: "/portal", replace: true }); }
  }, [loading, isStaff]);

  useEffect(() => {
    if (!isStaff) return;
    supabase.from("bookings").select("*").order("requested_at", { ascending: true }).then(({ data, error }) => {
      if (error) return toast.error(error.message);
      setRows(data as Booking[]);
    });
    const channel = supabase
      .channel("admin-bookings")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, (payload) => {
        setRows((prev) => {
          if (payload.eventType === "INSERT") {
            const row = payload.new as Booking;
            if (prev.some((r) => r.id === row.id)) return prev;
            toast.success(`New booking: ${row.name}`);
            return [...prev, row].sort((a, b) => a.requested_at.localeCompare(b.requested_at));
          }
          if (payload.eventType === "UPDATE") {
            const row = payload.new as Booking;
            return prev.map((r) => (r.id === row.id ? row : r));
          }
          if (payload.eventType === "DELETE") {
            const row = payload.old as Booking;
            return prev.filter((r) => r.id !== row.id);
          }
          return prev;
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isStaff]);

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    setRows((p) => p.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success(`Marked ${status}`);
  }

  return (
    <SiteLayout>
      <PageHero eyebrow="Operations" title="Bookings" description="Manage consultation requests." />
      <section className="container-x mt-10 mb-20">
        <div className="card-elevated overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs">{new Date(r.requested_at).toLocaleString()}</TableCell>
                  <TableCell><div className="font-medium text-sm">{r.name}</div><div className="text-xs text-muted-foreground">{r.email}</div></TableCell>
                  <TableCell className="text-xs">{r.service}</TableCell>
                  <TableCell className="text-xs">{r.phone || "—"}</TableCell>
                  <TableCell><span className="inline-block rounded-full bg-muted px-2 py-0.5 text-xs">{r.status}</span></TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {STATUSES.filter((s) => s !== r.status).map((s) => (
                        <button key={s} onClick={() => setStatus(r.id, s)}
                          className="text-[10px] rounded-full border border-border px-2 py-0.5 hover:bg-muted transition">{s}</button>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">No bookings yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
        <div className="mt-8"><Button variant="outline" onClick={() => navigate({ to: "/portal" })}>Back to Portal</Button></div>
      </section>
    </SiteLayout>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { useAuth, useRoles } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setCachedContactEmail } from "@/hooks/use-app-settings";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({
    meta: [
      { title: "Admin · Settings — Hadees Trading" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const { user } = useAuth();
  const { isSuperAdmin, isStaff, loading } = useRoles(user);
  const navigate = useNavigate();
  const [contactEmail, setContactEmail] = useState("");
  const [initialEmail, setInitialEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loading && !isStaff) {
      toast.error("Staff access required");
      navigate({ to: "/portal", replace: true });
    }
  }, [loading, isStaff, navigate]);

  useEffect(() => {
    if (!isStaff) return;
    supabase
      .from("app_settings")
      .select("key,value")
      .then(({ data, error }) => {
        if (error) return toast.error(error.message);
        const row = (data ?? []).find((r) => r.key === "contact_email");
        const v = row?.value ?? "info@hadeestrading.co.za";
        setContactEmail(v);
        setInitialEmail(v);
        setLoaded(true);
      });
  }, [isStaff]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!isSuperAdmin) {
      toast.error("Only super admins can change settings");
      return;
    }
    const trimmed = contactEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Enter a valid email address");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("app_settings")
      .upsert({ key: "contact_email", value: trimmed }, { onConflict: "key" });
    setSaving(false);
    if (error) return toast.error(error.message);
    setInitialEmail(trimmed);
    setCachedContactEmail(trimmed);
    toast.success("Contact email updated");
  }

  const dirty = contactEmail.trim() !== initialEmail;

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Admin"
        title="Platform settings"
        description="Configure the public contact email used across the site and outbound transactional emails."
      />

      <section className="container-x mt-12 max-w-2xl">
        <form onSubmit={handleSave} className="card-elevated p-8">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-[color:var(--royal)]" />
            <h2 className="text-lg font-semibold">Public contact email</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Shown in the footer, the contact page, and used as the reply-to on
            invoices and transactional emails sent from the platform.
          </p>

          <label className="mt-6 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Contact email
          </label>
          <Input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="info@hadeestrading.co.za"
            className="mt-2"
            disabled={!loaded || !isSuperAdmin}
            required
          />

          {!isSuperAdmin && loaded && (
            <p className="mt-3 text-xs text-amber-600">
              Only super admins can change this setting.
            </p>
          )}

          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              type="submit"
              disabled={saving || !dirty || !isSuperAdmin}
              className="inline-flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </section>
    </SiteLayout>
  );
}

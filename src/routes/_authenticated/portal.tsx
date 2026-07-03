import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BookOpen, User as UserIcon, ShieldCheck, LogOut, MessageCircle, FileText, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useAuth, useRoles } from "@/hooks/use-auth";
import { waLink } from "@/lib/company";

export const Route = createFileRoute("/_authenticated/portal")({
  head: () => ({
    meta: [
      { title: "Client Portal — Hadees Trading" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalPage,
});

function PortalPage() {
  const { user } = useAuth();
  const { isAdmin, isStaff } = useRoles(user);
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
      .then(({ data }) => setProfile(data));
  }, [user?.id]);

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <SiteLayout>
      <section className="container-x pt-8 pb-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Client Portal</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <PortalCard icon={BookOpen} title="My Learning" description="Continue Academy courses" to="/my-learning" />
          <PortalCard icon={FileText} title="My Orders & Documents" description="Track engagements & files" to="/orders" />
          <PortalCard icon={Calendar} title="Book a Consultation" description="Free 30-min discovery" to="/book" />
          <PortalCard icon={UserIcon} title="My Profile" description="Update contact details" to="/portal" />
          <PortalCard
            icon={MessageCircle}
            title="Talk to us"
            description="Reach us on WhatsApp"
            href={waLink("Hi Hadees Trading, I'm signed into my portal and need help.")}
          />
          {isStaff && (
            <>
              <PortalCard icon={ShieldCheck} title="Admin · Leads" description="CRM pipeline" to="/admin/leads" />
              <PortalCard icon={ShieldCheck} title="Admin · Clients" description="Clients, orders, documents" to="/admin/clients" />
              <PortalCard icon={ShieldCheck} title="Admin · Bookings" description="Manage consultations" to="/admin/bookings" />
              <PortalCard icon={ShieldCheck} title="Admin · Courses" description="Manage Academy content" to="/admin/courses" />
            </>
          )}
        </div>

        {isAdmin && (
          <p className="mt-8 text-xs text-muted-foreground">You have <strong>admin</strong> access.</p>
        )}
      </section>
    </SiteLayout>
  );
}

function PortalCard({
  icon: Icon, title, description, to, href, disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  to?: string;
  href?: string;
  disabled?: boolean;
}) {
  const body = (
    <Card className={`h-full transition ${disabled ? "opacity-60" : "hover:shadow-elegant hover:-translate-y-0.5"}`}>
      <CardHeader>
        <div className="grid h-11 w-11 place-items-center rounded-xl gradient-royal text-white shadow-elegant">
          <Icon className="h-5 w-5" />
        </div>
        <CardTitle className="mt-3">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <span className="text-sm font-medium text-primary">
          {disabled ? "Soon" : "Open →"}
        </span>
      </CardContent>
    </Card>
  );
  if (disabled) return body;
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer">{body}</a>;
  if (to) return <Link to={to}>{body}</Link>;
  return body;
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/client-portal")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: RedirectPage,
});

function RedirectPage() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      navigate({ to: data.session ? "/portal" : "/auth", replace: true });
    });
  }, [navigate]);
  return null;
}

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_CONTACT_EMAIL = "info@hadeestrading.co.za";

let cachedEmail: string | null = null;
const listeners = new Set<(v: string) => void>();

async function fetchContactEmail(): Promise<string> {
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "contact_email")
    .maybeSingle();
  return data?.value?.trim() || DEFAULT_CONTACT_EMAIL;
}

export function useContactEmail(): string {
  const [email, setEmail] = useState<string>(cachedEmail ?? DEFAULT_CONTACT_EMAIL);

  useEffect(() => {
    let active = true;
    if (cachedEmail == null) {
      fetchContactEmail().then((v) => {
        cachedEmail = v;
        if (active) setEmail(v);
        listeners.forEach((l) => l(v));
      });
    }
    const l = (v: string) => setEmail(v);
    listeners.add(l);
    return () => {
      active = false;
      listeners.delete(l);
    };
  }, []);

  return email;
}

export function setCachedContactEmail(v: string) {
  cachedEmail = v;
  listeners.forEach((l) => l(v));
}

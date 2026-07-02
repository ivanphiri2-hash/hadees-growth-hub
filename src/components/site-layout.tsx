import type { ReactNode } from "react";
import { SiteNav } from "./site-nav";
import { SiteFooter } from "./site-footer";
import { FloatingActions } from "./floating-actions";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteNav />
      <main className="flex-1 pt-16">{children}</main>
      <SiteFooter />
      <FloatingActions />
    </div>
  );
}

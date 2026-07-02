import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-[color:var(--surface-2)] border-b border-border">
      <div className="absolute inset-0 opacity-40 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(600px 300px at 20% 0%, oklch(0.55 0.2 264 / 0.15), transparent 60%), radial-gradient(500px 250px at 90% 20%, oklch(0.78 0.15 75 / 0.12), transparent 60%)" }}
      />
      <div className="container-x relative py-16 lg:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--royal)]">{eyebrow}</p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-foreground max-w-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl leading-relaxed">{description}</p>
        )}
        {children}
      </div>
    </section>
  );
}

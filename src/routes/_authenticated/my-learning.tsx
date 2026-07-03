import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  level: string | null;
};

export const Route = createFileRoute("/_authenticated/my-learning")({
  head: () => ({
    meta: [{ title: "My Learning — Hadees Trading Academy" }, { name: "robots", content: "noindex" }],
  }),
  component: MyLearningPage,
});

function MyLearningPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("courses")
      .select("id,title,slug,description,level")
      .eq("published", true)
      .order("order_index")
      .then(({ data }) => {
        setCourses(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <SiteLayout>
      <PageHero eyebrow="Academy" title="My Learning" description="Continue where you left off, or start a new course." />
      <section className="container-x mt-12 mb-24">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading courses…</p>
        ) : courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
            <h2 className="mt-4 font-semibold">No courses published yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Check back soon — new Academy content is on the way.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <Link key={c.id} to="/learn/$courseId" params={{ courseId: c.id }}>
                <Card className="h-full hover:shadow-elegant hover:-translate-y-0.5 transition">
                  <CardHeader>
                    {c.level && <span className="text-xs uppercase tracking-widest text-muted-foreground">{c.level}</span>}
                    <CardTitle className="mt-2">{c.title}</CardTitle>
                    <CardDescription>{c.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="text-sm font-medium text-primary">Start →</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

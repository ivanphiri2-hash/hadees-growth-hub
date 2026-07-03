import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

type Lesson = { id: string; title: string; content: string | null; video_url: string | null; order_index: number };
type Course = { id: string; title: string; description: string | null };

export const Route = createFileRoute("/_authenticated/learn/$courseId")({
  head: () => ({ meta: [{ title: "Learn — Hadees Trading Academy" }, { name: "robots", content: "noindex" }] }),
  component: LearnPage,
});

function LearnPage() {
  const { courseId } = Route.useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, boolean>>({});

  useEffect(() => {
    supabase.from("courses").select("id,title,description").eq("id", courseId).maybeSingle()
      .then(({ data }) => setCourse(data));
    supabase.from("lessons").select("id,title,content,video_url,order_index")
      .eq("course_id", courseId).order("order_index")
      .then(({ data }) => {
        const list = data ?? [];
        setLessons(list);
        if (list[0]) setActiveId(list[0].id);
      });
  }, [courseId]);

  useEffect(() => {
    if (!user || lessons.length === 0) return;
    supabase.from("student_progress").select("lesson_id,completed")
      .eq("user_id", user.id)
      .in("lesson_id", lessons.map((l) => l.id))
      .then(({ data }) => {
        const map: Record<string, boolean> = {};
        (data ?? []).forEach((r) => { map[r.lesson_id] = r.completed; });
        setProgress(map);
      });
  }, [user?.id, lessons]);

  const active = lessons.find((l) => l.id === activeId) ?? null;
  const doneCount = Object.values(progress).filter(Boolean).length;

  async function markComplete() {
    if (!user || !active) return;
    const { error } = await supabase.from("student_progress").upsert({
      user_id: user.id, lesson_id: active.id, completed: true, completed_at: new Date().toISOString(),
    }, { onConflict: "user_id,lesson_id" });
    if (error) { toast.error(error.message); return; }
    setProgress((p) => ({ ...p, [active.id]: true }));
    toast.success("Lesson marked complete");
    const idx = lessons.findIndex((l) => l.id === active.id);
    if (idx >= 0 && idx < lessons.length - 1) setActiveId(lessons[idx + 1].id);
  }

  return (
    <SiteLayout>
      <section className="container-x pt-8 pb-16">
        <Link to="/my-learning" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> My Learning
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{course?.title ?? "Course"}</h1>
            {course?.description && <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{course.description}</p>}
          </div>
          <span className="text-sm text-muted-foreground">{doneCount} / {lessons.length} complete</span>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-xl border border-border bg-card p-2 h-fit">
            {lessons.length === 0 && <p className="p-4 text-sm text-muted-foreground">No lessons yet.</p>}
            {lessons.map((l, i) => (
              <button
                key={l.id}
                onClick={() => setActiveId(l.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  activeId === l.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${
                  progress[l.id] ? "bg-green-500 text-white" : activeId === l.id ? "bg-white/20" : "bg-muted"
                }`}>
                  {progress[l.id] ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                <span className="flex-1 truncate">{l.title}</span>
              </button>
            ))}
          </aside>

          <div className="rounded-xl border border-border bg-card p-6">
            {active ? (
              <>
                <h2 className="text-xl font-semibold">{active.title}</h2>
                {active.video_url && (
                  <div className="mt-4 aspect-video overflow-hidden rounded-lg bg-black">
                    <iframe src={active.video_url} className="h-full w-full" allow="fullscreen" title={active.title} />
                  </div>
                )}
                {active.content && (
                  <div className="prose prose-sm mt-6 max-w-none whitespace-pre-wrap text-foreground">
                    {active.content}
                  </div>
                )}
                <div className="mt-6 flex justify-end">
                  <Button onClick={markComplete} disabled={progress[active.id]}>
                    {progress[active.id] ? "Completed" : "Mark complete"}
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Select a lesson to begin.</p>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

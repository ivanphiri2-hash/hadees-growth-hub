import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth, useRoles } from "@/hooks/use-auth";

type Course = { id: string; title: string; slug: string; description: string | null; published: boolean };
type Lesson = { id: string; course_id: string; title: string; content: string | null; video_url: string | null; order_index: number };

export const Route = createFileRoute("/_authenticated/admin/courses")({
  head: () => ({ meta: [{ title: "Admin · Courses — Hadees Trading" }, { name: "robots", content: "noindex" }] }),
  component: AdminCoursesPage,
});

function AdminCoursesPage() {
  const { user } = useAuth();
  const { isStaff, loading: rolesLoading } = useRoles(user);
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonVideo, setNewLessonVideo] = useState("");
  const [newLessonContent, setNewLessonContent] = useState("");

  useEffect(() => {
    if (!rolesLoading && !isStaff) {
      toast.error("Admin access required");
      navigate({ to: "/portal", replace: true });
    }
  }, [rolesLoading, isStaff, navigate]);

  useEffect(() => { loadCourses(); }, []);
  useEffect(() => { if (selected) loadLessons(selected); else setLessons([]); }, [selected]);

  async function loadCourses() {
    const { data } = await supabase.from("courses").select("id,title,slug,description,published").order("order_index");
    setCourses(data ?? []);
  }
  async function loadLessons(courseId: string) {
    const { data } = await supabase.from("lessons").select("*").eq("course_id", courseId).order("order_index");
    setLessons(data ?? []);
  }

  async function createCourse(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("courses").insert({
      title: newTitle, slug: newSlug || newTitle.toLowerCase().replace(/\s+/g, "-"),
      description: newDesc, published: false,
    });
    if (error) return toast.error(error.message);
    toast.success("Course created");
    setNewTitle(""); setNewSlug(""); setNewDesc("");
    loadCourses();
  }

  async function togglePublish(c: Course) {
    const { error } = await supabase.from("courses").update({ published: !c.published }).eq("id", c.id);
    if (error) return toast.error(error.message);
    loadCourses();
  }
  async function deleteCourse(id: string) {
    if (!confirm("Delete course and all its lessons?")) return;
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) return toast.error(error.message);
    if (selected === id) setSelected(null);
    loadCourses();
  }
  async function addLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    const { error } = await supabase.from("lessons").insert({
      course_id: selected, title: newLessonTitle, content: newLessonContent,
      video_url: newLessonVideo || null, order_index: lessons.length,
    });
    if (error) return toast.error(error.message);
    setNewLessonTitle(""); setNewLessonVideo(""); setNewLessonContent("");
    loadLessons(selected);
  }
  async function deleteLesson(id: string) {
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (error) return toast.error(error.message);
    if (selected) loadLessons(selected);
  }

  return (
    <SiteLayout>
      <PageHero eyebrow="Admin" title="Manage Academy courses" description="Create, publish, and edit courses and their lessons." />
      <section className="container-x mt-12 mb-24 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div>
          <h2 className="text-lg font-semibold">Courses</h2>
          <form onSubmit={createCourse} className="mt-4 space-y-3 rounded-xl border border-border p-4">
            <div><Label>Title</Label><Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required /></div>
            <div><Label>Slug</Label><Input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="auto from title" /></div>
            <div><Label>Description</Label><Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} /></div>
            <Button type="submit"><Plus className="h-4 w-4" /> Create course</Button>
          </form>

          <div className="mt-6 space-y-2">
            {courses.map((c) => (
              <Card key={c.id} className={selected === c.id ? "ring-2 ring-primary" : ""}>
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <button onClick={() => setSelected(c.id)} className="flex-1 text-left">
                    <div className="font-semibold">{c.title}</div>
                    <div className="text-xs text-muted-foreground">/{c.slug} · {c.published ? "Published" : "Draft"}</div>
                  </button>
                  <Button size="sm" variant="outline" onClick={() => togglePublish(c)}>
                    {c.published ? "Unpublish" : "Publish"}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteCourse(c.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            {courses.length === 0 && <p className="text-sm text-muted-foreground">No courses yet.</p>}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Lessons {selected ? "" : "(select a course)"}</h2>
          {selected && (
            <>
              <form onSubmit={addLesson} className="mt-4 space-y-3 rounded-xl border border-border p-4">
                <div><Label>Lesson title</Label><Input value={newLessonTitle} onChange={(e) => setNewLessonTitle(e.target.value)} required /></div>
                <div><Label>Video URL (embed)</Label><Input value={newLessonVideo} onChange={(e) => setNewLessonVideo(e.target.value)} placeholder="https://www.youtube.com/embed/..." /></div>
                <div><Label>Content</Label><Textarea value={newLessonContent} onChange={(e) => setNewLessonContent(e.target.value)} rows={5} /></div>
                <Button type="submit"><Plus className="h-4 w-4" /> Add lesson</Button>
              </form>
              <div className="mt-6 space-y-2">
                {lessons.map((l, i) => (
                  <Card key={l.id}>
                    <CardContent className="flex items-center justify-between gap-3 p-4">
                      <div><div className="font-medium">{i + 1}. {l.title}</div>
                        {l.video_url && <div className="text-xs text-muted-foreground truncate max-w-xs">{l.video_url}</div>}
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => deleteLesson(l.id)}><Trash2 className="h-4 w-4" /></Button>
                    </CardContent>
                  </Card>
                ))}
                {lessons.length === 0 && <p className="text-sm text-muted-foreground">No lessons yet.</p>}
              </div>
            </>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

import { useEffect, useRef, useState } from "react";
import { Bot, Send, X, Sparkles } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

export function TunadiChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi 👋 I'm Tunadi, your Hadees Trading assistant. Ask me about our services, the Academy, or how to get started." },
  ]);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setBusy(true);
    try {
      const res = await fetch("/api/tunadi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((m) => [...m, { role: "assistant", content: data.error || "Something went wrong." }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      }
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "Network error — please try again." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Chat with Tunadi"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full gradient-royal px-4 py-3 text-white shadow-elegant hover:scale-105 transition-transform"
      >
        {open ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
        <span className="text-sm font-semibold hidden sm:inline">{open ? "Close" : "Ask Tunadi"}</span>
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-40 w-[min(380px,calc(100vw-2.5rem))] rounded-3xl border border-border bg-background shadow-elegant overflow-hidden flex flex-col max-h-[70vh]">
          <div className="gradient-royal text-white px-4 py-3 flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-white/15"><Sparkles className="h-4 w-4" /></div>
            <div>
              <p className="text-sm font-semibold leading-tight">Tunadi</p>
              <p className="text-[11px] opacity-80">Hadees Trading AI assistant</p>
            </div>
          </div>
          <div ref={scroller} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[color:var(--surface-2)]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-background border border-border rounded-bl-sm"}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-background border border-border px-3.5 py-2 text-sm text-muted-foreground">Thinking…</div>
              </div>
            )}
          </div>
          <div className="border-t border-border p-2 flex gap-2 bg-background">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              placeholder="Ask about services, pricing, courses…"
              maxLength={500}
              className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm outline-none focus:border-[color:var(--royal)]"
            />
            <button
              onClick={send}
              disabled={busy || !input.trim()}
              className="grid h-10 w-10 place-items-center rounded-full gradient-royal text-white disabled:opacity-50"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

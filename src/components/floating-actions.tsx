import { useEffect, useState } from "react";
import { MessageCircle, ArrowUp } from "lucide-react";
import { waLink } from "@/lib/company";

export function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="grid h-11 w-11 place-items-center rounded-full border border-border bg-background/80 backdrop-blur-md shadow-elegant hover:bg-background transition"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
      <a
        href={waLink("Hello Hadees Trading, I'd like to chat.")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="group inline-flex items-center gap-2 rounded-full bg-[color:var(--whatsapp)] px-4 py-3 text-white shadow-[0_10px_40px_-10px_oklch(0.66_0.17_155/0.6)] hover:scale-105 transition-transform"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm font-semibold hidden sm:inline">WhatsApp us</span>
      </a>
    </div>
  );
}

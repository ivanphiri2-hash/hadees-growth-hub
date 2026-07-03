import { createFileRoute } from "@tanstack/react-router";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `You are Tunadi, the friendly AI assistant for HADEES TRADING PTY LTD, a South African company that helps entrepreneurs with:
- Business registration, SARS, B-BBEE, CIDB compliance
- Websites, digital solutions, branding
- The Hadees Trading Academy (trading education)

Be concise, warm, professional. Speak South African English. When users want to buy or book, direct them to WhatsApp on 083 753 5798, /contact, or /book. Never invent prices — instead direct users to the relevant page (/business-services, /digital-solutions, /academy). Keep answers under 6 short sentences unless asked for detail.`;

export const Route = createFileRoute("/api/tunadi")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { messages?: ChatMessage[] };
          const messages = Array.isArray(body.messages) ? body.messages : [];
          const key = process.env.LOVABLE_API_KEY;
          if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

          const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Lovable-API-Key": key,
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
            }),
          });

          if (!res.ok) {
            const text = await res.text();
            if (res.status === 429) return new Response(JSON.stringify({ error: "Tunadi is a bit busy right now — please try again in a moment." }), { status: 429, headers: { "Content-Type": "application/json" } });
            if (res.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Please contact us on WhatsApp." }), { status: 402, headers: { "Content-Type": "application/json" } });
            return new Response(JSON.stringify({ error: text }), { status: res.status, headers: { "Content-Type": "application/json" } });
          }
          const data = await res.json();
          const reply = data?.choices?.[0]?.message?.content ?? "Sorry, I couldn't respond right now.";
          return new Response(JSON.stringify({ reply }), { headers: { "Content-Type": "application/json" } });
        } catch (e) {
          return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { "Content-Type": "application/json" } });
        }
      },
    },
  },
});

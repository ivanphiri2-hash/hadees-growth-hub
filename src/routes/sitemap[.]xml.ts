import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL =
  process.env.SITE_URL ||
  process.env.VITE_SITE_URL ||
  "https://hadeestrading.co.za";

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "");

interface SitemapEntry {
  path: string;
  changefreq?: "weekly" | "monthly";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/business-services", changefreq: "monthly", priority: "0.9" },
          { path: "/digital-solutions", changefreq: "monthly", priority: "0.9" },
          { path: "/academy", changefreq: "monthly", priority: "0.9" },
          { path: "/knowledge-hub", changefreq: "weekly", priority: "0.7" },
          { path: "/about", changefreq: "monthly", priority: "0.6" },
          { path: "/contact", changefreq: "monthly", priority: "0.6" },
        ];

        const baseUrl = normalizeBaseUrl(BASE_URL);

        const urls = entries
          .map((e) => {
            const loc = new URL(e.path, `${baseUrl}/`).toString();

            return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`;
          })
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});

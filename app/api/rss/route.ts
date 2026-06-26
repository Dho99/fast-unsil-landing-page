import { fetchAllNews } from "@/lib/scrapers";
import type { NewsArticle } from "@/lib/constants";

function escapeXml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function itemToXml(article: NewsArticle): string {
    const pubDate = new Date(article.date).toUTCString();
    const link = article.link ?? "https://fast.unsil.ac.id/#berita";
    return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(link)}</link>
      <description>${escapeXml(article.excerpt || article.title)}</description>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(article.category)}</category>
      ${article.source ? `<source url="${escapeXml(link)}">${escapeXml(article.source)}</source>` : ""}
    </item>`;
}

export async function GET() {
    const news = await fetchAllNews();

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>FAST UNSIL – Agregasi Berita Dikti</title>
    <link>https://fast.unsil.ac.id</link>
    <description>Agregasi pengumuman dari portal Kemdiktisaintek dan BRIN</description>
    <language>id</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://fast.unsil.ac.id/api/rss" rel="self" type="application/rss+xml"/>
${news.map(itemToXml).join("\n")}
  </channel>
</rss>`;

    return new Response(xml, {
        headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
    });
}

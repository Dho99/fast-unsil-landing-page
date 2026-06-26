import { fetchAllPublications } from "@/lib/scrapers/publications";
import type { Publication } from "@/lib/constants";

function escapeXml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function pubToXml(pub: Publication): string {
    const link = pub.link ?? `https://fast.unsil.ac.id/#riset`;
    return `    <item>
      <title>${escapeXml(pub.title)}</title>
      <link>${escapeXml(link)}</link>
      <description>${escapeXml(`${pub.authors} · ${pub.venue} (${pub.year})`)}</description>
      <pubDate>${new Date(pub.year, 0, 1).toUTCString()}</pubDate>
      <category>Publikasi</category>
    </item>`;
}

export async function GET() {
    const publications = await fetchAllPublications();

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>FAST UNSIL – Publikasi Ilmiah</title>
    <link>https://fast.unsil.ac.id</link>
    <description>Publikasi penelitian dari anggota FAST Universitas Siliwangi</description>
    <language>id</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://fast.unsil.ac.id/api/rss/publications" rel="self" type="application/rss+xml"/>
${publications.map(pubToXml).join("\n")}
  </channel>
</rss>`;

    return new Response(xml, {
        headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
    });
}

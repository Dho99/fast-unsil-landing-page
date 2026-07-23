import type { NewsArticle, Publication } from "@/lib/constants";

const SITE = "https://fast.unsil.ac.id";

export function escapeXml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function newsItemToXml(article: NewsArticle): string {
    const pubDate = new Date(article.date).toUTCString();
    const link = article.link ?? `${SITE}/#berita`;
    return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(link)}</link>
      <description>${escapeXml(article.excerpt || article.title)}</description>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(article.category)}</category>
      ${article.source ? `<source url="${escapeXml(link)}">${escapeXml(article.source)}</source>` : ""}
    </item>`;
}

function publicationItemToXml(pub: Publication): string {
    const link = pub.link ?? `${SITE}/#riset`;
    return `    <item>
      <title>${escapeXml(pub.title)}</title>
      <link>${escapeXml(link)}</link>
      <description>${escapeXml(`${pub.authors} · ${pub.venue} (${pub.year})`)}</description>
      <pubDate>${new Date(pub.year, 0, 1).toUTCString()}</pubDate>
      <category>Publikasi</category>
    </item>`;
}

export function buildNewsRssXml(articles: NewsArticle[]): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>FAST UNSIL – Agregasi Berita Dikti</title>
    <link>${SITE}</link>
    <description>Agregasi pengumuman dari portal Kemdiktisaintek dan BRIN</description>
    <language>id</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE}/rss" rel="self" type="application/rss+xml"/>
${articles.map(newsItemToXml).join("\n")}
  </channel>
</rss>`;
}

export function buildPublicationsRssXml(publications: Publication[]): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>FAST UNSIL – Publikasi Ilmiah</title>
    <link>${SITE}</link>
    <description>Publikasi penelitian dari anggota FAST Universitas Siliwangi</description>
    <language>id</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE}/rss/publications" rel="self" type="application/rss+xml"/>
${publications.map(publicationItemToXml).join("\n")}
  </channel>
</rss>`;
}

export const NEWS_RSS_HEADERS = {
    "Content-Type": "application/rss+xml; charset=utf-8",
    "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
} as const;

export const PUBLICATIONS_RSS_HEADERS = {
    "Content-Type": "application/rss+xml; charset=utf-8",
    "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
} as const;

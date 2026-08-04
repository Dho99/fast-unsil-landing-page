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

function sanitizeHtmlEntities(raw: string): string {
    return raw
        .replace(/&#x[\dA-Fa-f]+(?![;])/g, (m) => m + ";")
        .replace(/&#[\d]+(?![;])/g, (m) => m + ";");
}

function absoluteUrl(url: string | undefined, fallback: string): string {
    if (!url) return fallback;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${SITE}${url.startsWith("/") ? "" : "/"}${url}`;
}

function newsItemToXml(article: NewsArticle): string {
    const pubDate = new Date(article.date).toUTCString();
    const link = absoluteUrl(article.link, `${SITE}/#berita`);
    const guid = article.id || link;

    const description = sanitizeHtmlEntities(
        escapeXml(article.excerpt || article.title),
    );

    let sourceXml = "";
    if (article.source) {
        const sourceUrl = absoluteUrl(article.link, SITE);
        sourceXml = `<source url="${escapeXml(sourceUrl)}">${escapeXml(article.source)}</source>`;
    }

    return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="false">${escapeXml(guid)}</guid>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(article.category)}</category>
      ${sourceXml}
    </item>`;
}

function publicationItemToXml(pub: Publication): string {
    const link = absoluteUrl(pub.link, `${SITE}/#riset`);
    const guid = `pub-${pub.no}`;
    return `    <item>
      <title>${escapeXml(pub.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="false">${escapeXml(guid)}</guid>
      <description>${escapeXml(`${pub.authors} · ${pub.venue} (${pub.year})`)}</description>
      <pubDate>${new Date(pub.year, 0, 1).toUTCString()}</pubDate>
      <category>Publikasi</category>
    </item>`;
}

export function buildNewsRssXml(articles: NewsArticle[], selfUrl?: string): string {
    const self = selfUrl ?? `${SITE}/rss`;
    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>FAST UNSIL – Agregasi Berita Dikti</title>
    <link>${SITE}</link>
    <description>Agregasi pengumuman dari portal Kemdiktisaintek dan BRIN</description>
    <language>id</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(self)}" rel="self" type="application/rss+xml"/>
${articles.map(newsItemToXml).join("\n")}
  </channel>
</rss>`;
}

export function buildPublicationsRssXml(publications: Publication[], selfUrl?: string): string {
    const self = selfUrl ?? `${SITE}/rss/publications`;
    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>FAST UNSIL – Publikasi Ilmiah</title>
    <link>${SITE}</link>
    <description>Publikasi penelitian dari anggota FAST Universitas Siliwangi</description>
    <language>id</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(self)}" rel="self" type="application/rss+xml"/>
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

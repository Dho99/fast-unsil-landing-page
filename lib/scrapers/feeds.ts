import * as cheerio from "cheerio";
import type { NewsArticle } from "@/lib/constants";

interface FeedOptions {
    category: string;
    categoryColor: string;
    imagePlaceholder: string;
    source: string;
    limit?: number;
    prefix?: string;
}

export async function parseRssFeed(
    url: string,
    opts: FeedOptions
): Promise<NewsArticle[]> {
    const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; RSS-aggregator)" },
        signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const $ = cheerio.load(xml, { xmlMode: true });
    const items: NewsArticle[] = [];
    const limit = opts.limit ?? 10;
    const prefix = opts.prefix ?? "feed";

    $("item").each((i, el) => {
        if (i >= limit) return false;
        const $el = $(el);

        const title = $el.find("title").text().trim();
        if (!title) return;

        // RSS 2.0: <link> is text content; some feeds use <guid> as link
        const link =
            $el.find("link").text().trim() ||
            $el.find("guid").text().trim() ||
            "";

        const pubDateRaw = $el.find("pubDate").first().text().trim();
        const date = pubDateRaw
            ? new Date(pubDateRaw).toISOString()
            : new Date().toISOString();
        const publishedAt = date;

        // Strip CDATA and HTML tags from description
        const rawDesc = $el.find("description").text().trim();
        const excerpt = rawDesc.replace(/<[^>]+>/g, "").slice(0, 200);

        items.push({
            id: `${prefix}-${i}`,
            category: opts.category,
            categoryColor: opts.categoryColor,
            imagePlaceholder: opts.imagePlaceholder,
            title,
            date,
            publishedAt,
            excerpt,
            link,
            source: opts.source,
        });
    });

    return items;
}

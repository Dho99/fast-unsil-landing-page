import * as cheerio from "cheerio";
import type { NewsArticle } from "@/lib/constants";

const URL = "https://pendanaan-risnov.brin.go.id/pendanaan";
const CATEGORY_COLOR = "#DC2626";
const GRADIENT =
    "linear-gradient(135deg, #3b0a0a 0%, #1a0505 60%, #2a1010 100%)";

function timestampToIso(raw: string): string {
    const ts = parseInt(raw.trim(), 10);
    if (isNaN(ts)) return new Date().toISOString();
    return new Date(ts * 1000).toISOString();
}

export async function scrapeBrin(): Promise<NewsArticle[]> {
    const res = await fetch(URL, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; RSS-aggregator)" },
        signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);
    const items: NewsArticle[] = [];

    // Structure: div.pengumuman-item > h3 (title), .pengumuman-date (unix ts), .pengumuman-files a (link)
    $(".pengumuman-item").each((i, el) => {
        if (i >= 10) return false;
        const $el = $(el);

        const title = $el.find("h3").first().text().trim();
        if (!title) return;

        const rawDate = $el.find(".pengumuman-date").first().text().trim();
        const date = timestampToIso(rawDate);

        // Use first file link as the article link; fall back to the portal itself
        const fileLink = $el.find(".pengumuman-files a").first().attr("href") ?? "";
        const link = fileLink || URL;

        const refNum = $el.find(".pengumuman-title-number strong").text().trim();
        const excerpt = refNum ? `No. ${refNum}` : "";

        items.push({
            id: `brin-${i}`,
            category: "Pendanaan BRIN",
            categoryColor: CATEGORY_COLOR,
            imagePlaceholder: GRADIENT,
            title,
            date,
            excerpt,
            link,
            source: "BRIN Pendanaan Risnov",
        });
    });

    return items;
}

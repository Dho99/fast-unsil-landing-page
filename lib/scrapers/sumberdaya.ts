import * as cheerio from "cheerio";
import type { NewsArticle } from "@/lib/constants";
import { parseIndonesianDate } from "./utils";

const BASE = "https://sumberdayadikti.kemdiktisaintek.go.id";
const URL = `${BASE}/web/artikel`;
const CATEGORY_COLOR = "#6366F1";
const GRADIENT =
    "linear-gradient(135deg, #1a1040 0%, #0d1b35 60%, #1e2a4a 100%)";

export async function scrapeSumberdaya(): Promise<NewsArticle[]> {
    const res = await fetch(URL, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; RSS-aggregator)" },
        signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);
    const items: NewsArticle[] = [];

    // All articles are flat siblings inside one div.col:
    //   h3.artikel-judul  → title
    //   p (no class)       → excerpt + "[selengkapnya]" link with href
    //   p.artikel-foot     → date text
    $("h3.artikel-judul").each((_, el) => {
        if (items.length >= 10) return false;
        const $h3 = $(el);

        const title = $h3.text().trim();
        if (!title || title.length < 5) return;

        // Next sibling <p> holds the excerpt and the article link
        const $body = $h3.next("p");
        const href = $body.find("a[href*='/web/artikel/view/']").attr("href") ?? "";
        if (!href) return;
        const link = href.startsWith("http") ? href : `${BASE}${href}`;

        const excerpt = $body.clone().find("a").remove().end()
            .text().trim().slice(0, 200);

        // p.artikel-foot comes after the body <p>
        const footText = $body.next("p.artikel-foot").text().trim();
        const date = parseIndonesianDate(footText) ?? new Date().toISOString();
        const publishedAt = parseIndonesianDate(footText) ?? new Date().toISOString();

        items.push({
            id: `sumberdaya-${items.length}`,
            category: "Sumber Daya",
            categoryColor: CATEGORY_COLOR,
            imagePlaceholder: GRADIENT,
            title,
            date,
            publishedAt,
            excerpt,
            link,
            source: "Direktorat Sumber Daya",
        });
    });

    return items;
}

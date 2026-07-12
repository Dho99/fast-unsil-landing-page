import * as cheerio from "cheerio";
import type { NewsArticle } from "@/lib/constants";
import { parseIndonesianDate } from "./utils";

const BASE = "https://kemdiktisaintek.go.id";
const URL = `${BASE}/announcement`;
const CATEGORY_COLOR = "#3B82F6";
const GRADIENT =
    "linear-gradient(135deg, #1e3a5f 0%, #0d1b35 60%, #1a2840 100%)";

export async function scrapeKemdikti(): Promise<NewsArticle[]> {
    const res = await fetch(URL, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; RSS-aggregator)" },
        signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);
    const items: NewsArticle[] = [];

    const READ_MORE = /selengkapnya|lihat\s*(detail|pengumuman)|baca\s*lebih|read\s*more/i;
    let count = 0;

    // Articles link to /announcement/article/...
    $("a[href*='/announcement/article']").each((_, el) => {
        if (count >= 10) return false;
        const $el = $(el);

        // Skip "read more" buttons
        const anchorText = $el.text().trim();
        if (READ_MORE.test(anchorText) || !anchorText || anchorText.length < 5) return;

        const href = $el.attr("href") ?? "";
        const link = href.startsWith("http") ? href : `${BASE}${href}`;
        const title = anchorText;

        // Date: look for text matching date pattern near the element
        const parent = $el.closest("[class]");
        const dateText =
            parent
                .find("*")
                .filter((_, el) =>
                    /\d{1,2}\s+\w+\s+\d{4}/.test($(el).text())
                )
                .first()
                .text()
                .trim() ?? "";

        const date = parseIndonesianDate(dateText) ?? new Date().toISOString();
        const publishedAt = parseIndonesianDate(dateText) ?? new Date().toISOString();

        // Category tag if present
        const categoryEl = parent.find("[class*='categ'],[class*='tag'],[class*='label']").first();
        const category = categoryEl.text().trim() || "Kemdikti";

        items.push({
            id: `kemdikti-${count}`,
            category: category.replace(/-/g, " "),
            categoryColor: CATEGORY_COLOR,
            imagePlaceholder: GRADIENT,
            title,
            date,
            publishedAt,
            excerpt: "",
            link,
            source: "Kemdiktisaintek",
        });
        count++;
    });

    return items;
}

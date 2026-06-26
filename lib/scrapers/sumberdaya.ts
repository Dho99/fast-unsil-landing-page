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

    const READ_MORE = /selengkapnya|lihat\s*detail|baca\s*lebih|read\s*more/i;
    let count = 0;

    // Articles link to /web/artikel/view/[id]
    $("a[href*='/web/artikel/view/']").each((_, el) => {
        if (count >= 10) return false;
        const $el = $(el);

        // Skip "read more" buttons — title anchors have the real title as text
        const anchorText = $el.text().trim();
        if (READ_MORE.test(anchorText) || !anchorText || anchorText.length < 5) return;

        const href = $el.attr("href") ?? "";
        const link = href.startsWith("http") ? href : `${BASE}${href}`;
        const title = anchorText;
        const parent = $el.closest("[class]");

        // Date: text matching date pattern
        let dateText = "";
        parent.find("*").each((_, node) => {
            const t = $(node).text().trim();
            if (/\d{1,2}\s+\w+\s+\d{4}|\d{4}-\d{2}-\d{2}/.test(t)) {
                dateText = t;
                return false;
            }
        });

        const date = parseIndonesianDate(dateText) ?? new Date().toISOString();

        // Excerpt: any paragraph text in parent
        const excerpt =
            parent.find("p").first().text().trim().slice(0, 200) || "";

        items.push({
            id: `sumberdaya-${count}`,
            category: "Sumber Daya",
            categoryColor: CATEGORY_COLOR,
            imagePlaceholder: GRADIENT,
            title,
            date,
            excerpt,
            link,
            source: "Direktorat Sumber Daya",
        });
        count++;
    });

    return items;
}

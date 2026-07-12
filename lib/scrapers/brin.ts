import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";
import type { NewsArticle } from "@/lib/constants";

const URL = "https://pendanaan-risnov.brin.go.id/pendanaan";
const CATEGORY_COLOR = "#DC2626";
const GRADIENT =
    "linear-gradient(135deg, #3b0a0a 0%, #1a0505 60%, #2a1010 100%)";

function sanitizeId(id: string | number): string {
    return String(id).replace(/[^a-zA-Z0-9\-_]/g, "_").slice(0, 64);
}

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

    // Table: #daftar-pengumuman tbody tr.pengumuman-box
    // Cells: td[0]=unix-ts (hidden), td[1]=content, td[2]=created-ts (hidden)
    $("#daftar-pengumuman tbody tr.pengumuman-box").each((i, el) => {
        if (i >= 10) return false;
        const $el = $(el);

        const tds = $el.find("td");
        const rawDate = tds.eq(0).find("span").first().text().trim();
        const date = timestampToIso(rawDate);

        const $content = tds.eq(1);
        const title = $content.find(".pengumuman-judul").first().text().trim();
        if (!title) return;

        const refNum = $content.find(".pengumuman-top b").first().text().trim();
        const excerpt = refNum ? `No. ${refNum}` : "";

        const rawPdfLink = $content.find(".pengumuman-dokumen li a").first().attr("href");
        const brinId = sanitizeId(title).slice(0, 48);
        const localPdfPath = `/pdfs/brin/${brinId}.pdf`;
        const localExists = fs.existsSync(
            path.join(process.cwd(), "public", localPdfPath)
        );

        const pdfLink = rawPdfLink
            ? (localExists ? localPdfPath : `/api/brin-pdf?idx=${i}`)
            : undefined;
        const link = pdfLink ?? URL;

        items.push({
            id: `brin-${i}`,
            category: "Pendanaan BRIN",
            categoryColor: CATEGORY_COLOR,
            imagePlaceholder: GRADIENT,
            title,
            date,
            publishedAt: date,
            excerpt,
            link,
            pdfLink,
            source: "BRIN Pendanaan Risnov",
        });
    });

    return items;
}

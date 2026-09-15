import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";
import type { NewsArticle } from "@/lib/constants";
import { parseIndonesianDate, fetchWithRetry } from "./utils";

const URL = "https://pendanaan-risnov.brin.go.id/pendanaan";
const CATEGORY_COLOR = "#DC2626";
const GRADIENT =
    "linear-gradient(135deg, #3b0a0a 0%, #1a0505 60%, #2a1010 100%)";

function sanitizeId(id: string | number): string {
    return String(id).replace(/[^a-zA-Z0-9\-_]/g, "_").slice(0, 64);
}

function timestampToIso(raw: string): string | null {
    const ts = parseInt(raw.trim(), 10);
    if (isNaN(ts)) return null;
    return new Date(ts * 1000).toISOString();
}

export async function scrapeBrin(): Promise<NewsArticle[]> {
    let res: Response;
    try {
        res = await fetchWithRetry(URL, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; RSS-aggregator)" },
            signal: AbortSignal.timeout(20000),
        });
    } catch {
        return [];
    }
    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);
    const items: NewsArticle[] = [];

    // Table: #daftar-pengumuman tbody tr.pengumuman-box
    // Cells: td[0]=unix-ts (doc date), td[1]=content, td[2]=created-ts (upload)
    // The site lists announcements oldest→newest; reverse to surface the latest.
    const rows = $("#daftar-pengumuman tbody tr.pengumuman-box")
        .toArray()
        .reverse()
        .slice(0, 10);

    // PDF proxy index: counts only rows that actually carry a file, so it
    // matches app/api/brin-pdf/route.ts (rows with an empty <ul> are skipped).
    let pdfIdx = 0;

    rows.forEach((el) => {
        const $el = $(el);

        const tds = $el.find("td");
        const rawDate = tds.eq(0).find("span").first().text().trim();
        const date =
            timestampToIso(rawDate) ||
            parseIndonesianDate(
                tds.eq(1).find(".pengumuman-top span").first().text().trim()
            ) ||
            new Date().toISOString();

        const $content = tds.eq(1);
        const title = $content.find(".pengumuman-judul").first().text().trim();
        if (!title) return;

        const refNum = $content.find(".pengumuman-top b").first().text().trim();
        const excerpt = refNum ? `No. ${refNum}` : "";

        const rawPdfLink = $content.find(".pengumuman-dokumen li a").first().attr("href");
        const brinId = sanitizeId(title).slice(0, 64);
        const localPdfPath = `/pdfs/brin/${brinId}.pdf`;
        const localExists = fs.existsSync(path.join(process.cwd(), "public", localPdfPath));

        const hasPdf = !!rawPdfLink;
        const pdfLink = hasPdf
            ? (localExists ? localPdfPath : `/api/brin-pdf?idx=${pdfIdx++}`)
            : undefined;
        const link = pdfLink ?? URL;

        items.push({
            id: `brin-${items.length}`,
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
            createdAt: new Date().toISOString(),
        });
    });

    return items;
}

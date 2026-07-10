import fs from "fs";
import path from "path";
import { Agent } from "undici";
import type { NewsArticle } from "@/lib/constants";

function sanitizeId(id: string | number): string {
    return String(id).replace(/[^a-zA-Z0-9\-_]/g, "_").slice(0, 64);
}

// API uses a certificate that Node's default trust store can't verify
const sslBypassAgent = new Agent({ connect: { rejectUnauthorized: false } });

// API lives on a separate domain, no SSL issues
const API_URL = "https://apibima.kemdiktisaintek.go.id/api/v1/pengumuman";
const PORTAL_URL = "https://bima.kemdiktisaintek.go.id/pengumuman";
const CATEGORY_COLOR = "#D97706";
const GRADIENT =
    "linear-gradient(135deg, #451a03 0%, #2d1200 60%, #5c2d0a 100%)";

interface BimaFile {
    url: string;
    nama?: string;
}

interface BimaItem {
    id: string;
    judul: string;
    tgl_pemberitaan: string;
    no_surat?: string;
    ringkasan?: string;
    files?: BimaFile[];
}

export async function scrapeBima(): Promise<NewsArticle[]> {
    const res = await fetch(API_URL, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; RSS-aggregator)" },
        signal: AbortSignal.timeout(8000),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(sslBypassAgent && { dispatcher: sslBypassAgent as any }),
    });
    if (!res.ok) return [];

    let body: { code?: number; data?: BimaItem[] };
    try {
        body = await res.json();
    } catch {
        return [];
    }

    if (body.code !== 200 || !Array.isArray(body.data)) return [];

    return body.data.slice(0, 10).map((item, i) => {
        const rawPdfLink = item.files?.[0]?.url;
        const bimaId = sanitizeId(item.id);
        const localPdfPath = `/pdfs/bima/${bimaId}.pdf`;
        const localExists = fs.existsSync(
            path.join(process.cwd(), "public", localPdfPath)
        );

        return {
            id: `bima-${i}`,
            category: "BIMA",
            categoryColor: CATEGORY_COLOR,
            imagePlaceholder: GRADIENT,
            title: item.judul,
            date: item.tgl_pemberitaan
                ? new Date(item.tgl_pemberitaan).toISOString()
                : new Date().toISOString(),
            excerpt: item.no_surat ? `No. ${item.no_surat}` : (item.ringkasan ?? ""),
            link: PORTAL_URL,
            // prefer local static file; fall back to live proxy if not yet downloaded
            pdfLink: rawPdfLink
                ? localExists ? localPdfPath : `/api/bima-pdf?idx=${i}`
                : undefined,
            source: "BIMA",
        };
    });
}

import type { NewsArticle } from "@/lib/constants";
import { getPdfFiles } from "@/lib/pdf-index";

const CATEGORY_COLOR = "#DC2626";
const GRADIENT =
    "linear-gradient(135deg, #3b0a0a 0%, #1a0505 60%, #2a1010 100%)";
const FALLBACK_URL = "https://pendanaan-risnov.brin.go.id/pendanaan";

export async function scrapeBrin(): Promise<NewsArticle[]> {
    // Filesystem source — no external fetch to pendanaan-risnov.brin.go.id
    // Uses crawler output in public/pdfs/brin/*.pdf (synced via GitHub Actions SCP)
    const files = getPdfFiles("brin");
    if (files.length === 0) return [];

    return files.slice(0, 10).map((f, idx) => ({
        id: `brin-${idx}`,
        category: "Pendanaan BRIN",
        categoryColor: CATEGORY_COLOR,
        imagePlaceholder: GRADIENT,
        title: f.title,
        date: f.publishedAt,
        publishedAt: f.publishedAt,
        excerpt: "",
        link: f.url,
        pdfLink: f.url,
        source: "BRIN Pendanaan Risnov",
        createdAt: new Date().toISOString(),
    }));
}

// Keep fallback URL for reference if needed (not used at runtime)
export const BRIN_FALLBACK_URL = FALLBACK_URL;

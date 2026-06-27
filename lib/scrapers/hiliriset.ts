import type { NewsArticle } from "@/lib/constants";

const BASE = "https://hiliriset.kemdiktisaintek.go.id";
const URL = `${BASE}/pengumuman?sort=published_at%7Cdesc`;
const CATEGORY_COLOR = "#059669";
const GRADIENT =
    "linear-gradient(135deg, #064e3b 0%, #022c22 60%, #065f46 100%)";

interface HilirisetAttachment {
    url: string;
    mime?: string;
    name?: string;
}

interface HilirisetItem {
    id: string;
    title: string;
    published_at: string;
    document_number?: string;
    attachments?: HilirisetAttachment[];
}

export async function scrapeHiliriset(): Promise<NewsArticle[]> {
    const res = await fetch(URL, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; RSS-aggregator)" },
        signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];

    const html = await res.text();

    // Inertia.js embeds page data in data-page attribute (double-quoted, HTML entities escaped)
    const match = html.match(/data-page="([^"]+)"/);
    if (!match) return [];

    let data: { props?: { contents?: { data?: HilirisetItem[] } } };
    try {
        const raw = match[1]
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&amp;/g, "&");
        data = JSON.parse(raw);
    } catch {
        return [];
    }

    const items = data.props?.contents?.data ?? [];

    return items.slice(0, 10).map((item, i) => {
        const attachment = item.attachments?.[0];
        const pdfLink = attachment?.url;
        const link = pdfLink ?? `${BASE}/pengumuman`;

        return {
            id: `hiliriset-${i}`,
            category: "Hiliriset",
            categoryColor: CATEGORY_COLOR,
            imagePlaceholder: GRADIENT,
            title: item.title,
            date: item.published_at
                ? new Date(item.published_at).toISOString()
                : new Date().toISOString(),
            excerpt: item.document_number ? `No. ${item.document_number}` : "",
            link,
            pdfLink,
            source: "Hiliriset",
        };
    });
}

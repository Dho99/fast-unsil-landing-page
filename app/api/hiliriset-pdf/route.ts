const BASE = "https://hiliriset.kemdiktisaintek.go.id";
const LIST_URL = `${BASE}/pengumuman?sort=published_at%7Cdesc`;
const FALLBACK_URL = `${BASE}/pengumuman`;

interface HilirisetAttachment {
    url: string;
}

interface HilirisetItem {
    id: string;
    attachments?: HilirisetAttachment[];
}

export async function GET(request: Request) {
    const idx = Number(new URL(request.url).searchParams.get("idx") ?? "0");

    try {
        const res = await fetch(LIST_URL, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; RSS-aggregator)" },
            signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) throw new Error("list failed");

        const html = await res.text();
        const match = html.match(/data-page="([^"]+)"/);
        if (!match) throw new Error("no data-page");

        const raw = match[1]
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&amp;/g, "&");
        const data: { props?: { contents?: { data?: HilirisetItem[] } } } =
            JSON.parse(raw);

        const items = data.props?.contents?.data ?? [];
        const item = items[idx];
        if (!item) throw new Error("idx out of range");

        const pdfUrl = item.attachments?.[0]?.url;
        if (!pdfUrl) throw new Error("no attachment");

        return Response.redirect(pdfUrl, 302);
    } catch (err) {
        console.error("[hiliriset-pdf proxy]", err);
        return Response.redirect(FALLBACK_URL, 302);
    }
}

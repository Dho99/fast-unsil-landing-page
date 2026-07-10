import { Agent } from "undici";

const API_URL = "https://apibima.kemdiktisaintek.go.id/api/v1/pengumuman";
const PORTAL_URL = "https://bima.kemdiktisaintek.go.id/pengumuman";

const sslBypassAgent = new Agent({ connect: { rejectUnauthorized: false } });

interface BimaFile { url: string }
interface BimaItem { files?: BimaFile[] }

export async function GET(request: Request) {
    const idx = Number(new URL(request.url).searchParams.get("idx") ?? "0");

    try {
        const res = await fetch(API_URL, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; RSS-aggregator)" },
            signal: AbortSignal.timeout(8000),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...(sslBypassAgent && { dispatcher: sslBypassAgent as any }),
        });

        if (res.ok) {
            const body: { code?: number; data?: BimaItem[] } = await res.json();
            if (body.code === 200 && Array.isArray(body.data)) {
                const pdfUrl = body.data[idx]?.files?.[0]?.url;
                if (pdfUrl) return Response.redirect(pdfUrl, 302);
            }
        }
    } catch {
        // fall through to portal redirect
    }

    return Response.redirect(PORTAL_URL, 302);
}

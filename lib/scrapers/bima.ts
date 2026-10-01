import fs from "fs";
import path from "path";
import { Agent } from "undici";
import type { NewsArticle } from "@/lib/constants";

function sanitizeId(id: string | number): string {
    return String(id).replace(/[^a-zA-Z0-9\-_]/g, "_").slice(0, 64);
}

// API uses a certificate that Node's default trust store can't verify
const sslBypassAgent = new Agent({ connect: { rejectUnauthorized: false } });

const API_URL =
    "https://apibima.kemdiktisaintek.go.id/api/v1/pengumuman?sort=tgl_created:desc&page=1:10&criteria=is_deleted:false,type:pengumuman";
const PORTAL_URL = "https://bima.kemdiktisaintek.go.id/pengumuman";
const PORTAL_ORIGIN = "https://bima.kemdiktisaintek.go.id";
const CATEGORY_COLOR = "#D97706";
const GRADIENT =
    "linear-gradient(135deg, #451a03 0%, #2d1200 60%, #5c2d0a 100%)";

const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
];

const BIMA_HEADERS = {
    "User-Agent": USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": `${PORTAL_ORIGIN}/`,
    "Origin": PORTAL_ORIGIN,
    "Sec-Fetch-Site": "same-site",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Dest": "empty",
};

interface BimaFile {
    id?: string;
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

let cookieJar: string | null = null;

async function fetchWithBIMAHeaders(url: string): Promise<Response> {
    if (!cookieJar) {
        try {
            const portalRes = await fetch(PORTAL_ORIGIN, {
                headers: {
                    "User-Agent": USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
                },
                signal: AbortSignal.timeout(8000),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ...(sslBypassAgent && { dispatcher: sslBypassAgent as any }),
            });
            const setCookie = portalRes.headers.get("set-cookie");
            if (setCookie) cookieJar = setCookie.split(";")[0];
        } catch {
            // portal unreachable — proceed without cookie
        }
    }

    return fetch(url, {
        headers: {
            ...BIMA_HEADERS,
            ...(cookieJar ? { Cookie: cookieJar } : {}),
        },
        signal: AbortSignal.timeout(10000),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(sslBypassAgent && { dispatcher: sslBypassAgent as any }),
    });
}

export async function scrapeBima(): Promise<NewsArticle[]> {
    cookieJar = null;
    const res = await fetchWithBIMAHeaders(API_URL);
    if (!res.ok) return [];

    let body: { code?: number; data?: BimaItem[] };
    try {
        body = await res.json();
    } catch {
        return [];
    }

    if (body.code !== 200 || !Array.isArray(body.data)) return [];

    return body.data.slice(0, 10).map((item, i) => {
        const files = item.files ?? [];
        const attachments = files.map((f, fi) => {
            const fid = sanitizeId(f.id ?? `${item.id}-${fi}`);
            const localPdfPath = `/pdfs/bima/${fid}.pdf`;
            const localExists = fs.existsSync(
                path.join(process.cwd(), "public", localPdfPath)
            );
            return {
                name: f.nama ?? `Dokumen ${fi + 1}.pdf`,
                url: localExists
                    ? localPdfPath
                    : `/api/bima-pdf?idx=${i}&file=${fi}`,
            };
        });
        const pdfLinks = attachments.map((a) => a.url);

        const itemDate = item.tgl_pemberitaan
            ? new Date(item.tgl_pemberitaan).toISOString()
            : new Date().toISOString();

        return {
            id: `bima-${i}`,
            category: "BIMA",
            categoryColor: CATEGORY_COLOR,
            imagePlaceholder: GRADIENT,
            title: item.judul,
            date: itemDate,
            publishedAt: itemDate,
            excerpt: item.no_surat ? `No. ${item.no_surat}` : (item.ringkasan ?? ""),
            link: PORTAL_URL,
            pdfLink: pdfLinks[0],
            pdfLinks: pdfLinks.length > 0 ? pdfLinks : undefined,
            attachments: attachments.length > 0 ? attachments : undefined,
            source: "BIMA",
            createdAt: new Date().toISOString(),
        };
    });
}

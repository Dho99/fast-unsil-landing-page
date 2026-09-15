import type { NewsArticle } from "@/lib/constants";
import { fetchWithRetry } from "./utils";
import { Agent, fetch as undiciFetch } from "undici";

const API_URLS = [
    "https://apiarjuna.kemdiktisaintek.go.id/api/frontpage/getPopularNews?row=10",
    "https://arjuna-api-zmltmhkk4a-et.a.run.app/api/frontpage/getPopularNews?row=10",
];
const PORTAL_URL = "https://arjuna.kemdiktisaintek.go.id/#/pengumuman";
const CATEGORY_COLOR = "#8B5CF6";
const GRADIENT =
    "linear-gradient(135deg, #2e1065 0%, #1a0540 60%, #3b1f8e 100%)";

interface ArjunaItem {
    id: number;
    title: string;
    snapshot?: string;
    date_created: string;
    kategori: string;
    lampiran1?: string;
    lampiran2?: string;
    lampiran3?: string;
}

interface ArjunaResponse {
    status: boolean;
    message: string;
    error: unknown;
    data: ArjunaItem[];
}

function stripHtmlEntities(raw: string): string {
    return raw
        .replace(/&#x[\dA-Fa-f]+(?![;])/g, "")
        .replace(/&#[\d]+(?![;])/g, "")
        .replace(/<[^>]*>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, "/")
        .replace(/\s+/g, " ")
        .trim();
}

export async function scrapeArjuna(): Promise<NewsArticle[]> {
    let res: Response | null = null;
    let lastStatus = "";
    const sslBypassAgent = new Agent({ connect: { rejectUnauthorized: false } });
    for (const url of API_URLS) {
        for (const useBypass of [false, true] as const) {
            try {
                const r = useBypass
                    ? await (undiciFetch as unknown as typeof fetch)(url, {
                          headers: {
                              "User-Agent": "Mozilla/5.0 (compatible; RSS-aggregator)",
                              Accept: "application/json",
                          },
                          signal: AbortSignal.timeout(15000),
                          // @ts-expect-error undici dispatcher
                          dispatcher: sslBypassAgent,
                      })
                    : await fetchWithRetry(url, {
                          headers: {
                              "User-Agent": "Mozilla/5.0 (compatible; RSS-aggregator)",
                              Accept: "application/json",
                          },
                          signal: AbortSignal.timeout(15000),
                      });
                if (r.ok) {
                    res = r as Response;
                    break;
                }
                lastStatus = `${r.status} ${r.statusText} (${url}${useBypass ? " ssl-bypass" : ""})`;
            } catch (e) {
                lastStatus = `${e instanceof Error ? e.message : String(e)} (${url}${useBypass ? " ssl-bypass" : ""})`;
            }
        }
        if (res) break;
    }
    if (!res || !res.ok) {
        console.error("[arjuna] fetch failed:", lastStatus);
        return [];
    }

    let body: ArjunaResponse;
    try {
        body = await res.json();
    } catch {
        return [];
    }

    if (!body.status || !Array.isArray(body.data)) return [];

    return body.data
        .filter((item) => !/^\s*test\s+pengumuman\s*$/i.test((item.title || "").trim()))
        .slice(0, 10)
        .map((item, i) => {
        const pdfLink = item.lampiran1 || undefined;
        const link = pdfLink ?? PORTAL_URL;
        const cleanTitle = stripHtmlEntities(item.title);
        const excerpt = item.snapshot
            ? stripHtmlEntities(item.snapshot)
            : "";

        const rawDate = item.date_created
            ? new Date(item.date_created).toISOString()
            : new Date().toISOString();

        return {
            id: `arjuna-${item.id ?? i}`,
            category: "ARJUNA",
            categoryColor: CATEGORY_COLOR,
            imagePlaceholder: GRADIENT,
            title: cleanTitle,
            date: rawDate,
            publishedAt: rawDate,
            excerpt,
            link,
            pdfLink,
            source: "ARJUNA",
            createdAt: new Date().toISOString(),
        };
    });
}

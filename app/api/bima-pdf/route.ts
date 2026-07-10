import { Agent } from "undici";

const API_BASE = "https://apibima.kemdiktisaintek.go.id/api/v1";
const PORTAL_ORIGIN = "https://bima.kemdiktisaintek.go.id";
const PORTAL_URL = "https://bima.kemdiktisaintek.go.id/pengumuman";
const BUCKET_BASE = "https://storage.googleapis.com/sipp-be-files/";

const sslBypassAgent = new Agent({ connect: { rejectUnauthorized: false } });

const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
];

function randomUA(): string {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

let cookieJar: string | null = null;

async function ensureCookie(): Promise<void> {
    if (cookieJar) return;
    try {
        const portalRes = await fetch(PORTAL_ORIGIN, {
            headers: {
                "User-Agent": randomUA(),
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
            },
            signal: AbortSignal.timeout(8000),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...(sslBypassAgent && { dispatcher: sslBypassAgent as any }),
        });
        const setCookie = portalRes.headers.get("set-cookie");
        if (setCookie) cookieJar = setCookie.split(";")[0];
    } catch {
        // proceed without cookie
    }
}

function apiRequest(url: string, extra?: RequestInit): Promise<Response> {
    return fetch(url, {
        headers: {
            "User-Agent": randomUA(),
            Accept: "application/json, text/plain, */*",
            "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
            Referer: `${PORTAL_ORIGIN}/`,
            Origin: PORTAL_ORIGIN,
            ...(cookieJar ? { Cookie: cookieJar } : {}),
        },
        signal: AbortSignal.timeout(10000),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(sslBypassAgent && { dispatcher: sslBypassAgent as any }),
        ...extra,
    });
}

function extractPath(gcsUrl: string): string | null {
    if (!gcsUrl || !gcsUrl.startsWith(BUCKET_BASE)) return null;
    return encodeURIComponent(gcsUrl.slice(BUCKET_BASE.length));
}

export async function GET(request: Request) {
    const idx = Number(new URL(request.url).searchParams.get("idx") ?? "0");

    try {
        cookieJar = null;
        await ensureCookie();

        // 1. fetch list to map idx → item id
        const listRes = await apiRequest(
            `${API_BASE}/pengumuman?sort=tgl_created:desc&criteria=is_deleted:false,type:pengumuman&page=1:50`,
        );
        if (!listRes.ok) throw new Error("list failed");

        const listBody: { code?: number; data?: { id: string }[] } =
            await listRes.json();
        if (listBody.code !== 200 || !Array.isArray(listBody.data))
            throw new Error("bad list");
        const item = listBody.data[idx];
        if (!item) throw new Error("idx out of range");

        // 2. fetch detail for file URL
        const detailRes = await apiRequest(`${API_BASE}/pengumuman/${item.id}`);
        if (!detailRes.ok) throw new Error("detail failed");

        const detailBody: {
            code?: number;
            data?: { files?: { url: string }[] };
        } = await detailRes.json();
        if (detailBody.code !== 200 || !detailBody.data?.files?.[0]?.url)
            throw new Error("no files");
        const filePath = extractPath(detailBody.data.files[0].url);
        if (!filePath) throw new Error("bad path");

        // 3. generate signed URL (public endpoint, no JWT needed)
        const signedRes = await apiRequest(
            `${API_BASE}/file/public/signed-url/bulk`,
            {
                method: "POST",
                body: JSON.stringify({ paths: [filePath] }),
                headers: { "Content-Type": "application/json" },
            },
        );
        if (!signedRes.ok) throw new Error(`signed-url: ${signedRes.status}`);

        const signedBody: { code?: number; data?: { url: string }[] } =
            await signedRes.json();
        if (signedBody.code !== 200 || !signedBody.data?.[0]?.url)
            throw new Error("no signed url");

        return Response.redirect(signedBody.data[0].url, 302);
    } catch (err) {
        console.error("[bima-pdf proxy]", err);
        return Response.redirect(PORTAL_URL, 302);
    }
}

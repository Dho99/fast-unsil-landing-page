#!/usr/bin/env node
/**
 * BIMA PDF Downloader
 * Uses the public signed-url endpoint to generate temporary GCS signed URLs.
 * Run: node scripts/download-bima-pdfs.mjs
 *   or: npm run sync-pdfs
 */

import { writeFileSync, existsSync, mkdirSync, statSync } from "fs";
import { Agent, fetch as undiciFetch } from "undici";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "../public/pdfs/bima");
const API_BASE = "https://apibima.kemdiktisaintek.go.id/api/v1";
const PORTAL_ORIGIN = "https://bima.kemdiktisaintek.go.id";
const BUCKET_BASE = "https://storage.googleapis.com/sipp-be-files/";

// SSL bypass for BIMA API (untrusted cert)
const sslBypassAgent = new Agent({ connect: { rejectUnauthorized: false } });

const BIMA_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

let cookieJar = null;

async function ensureCookie() {
    if (cookieJar) return;
    try {
        const res = await undiciFetch(PORTAL_ORIGIN, {
            headers: {
                "User-Agent": BIMA_UA,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
            },
            signal: AbortSignal.timeout(8000),
            dispatcher: sslBypassAgent,
        });
        const setCookie = res.headers.get("set-cookie");
        if (setCookie) cookieJar = setCookie.split(";")[0];
    } catch {
        // proceed without cookie
    }
}

function makeFetchOpts(extra = {}) {
    return {
        headers: {
            "User-Agent": BIMA_UA,
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
            "Referer": `${PORTAL_ORIGIN}/`,
            "Origin": PORTAL_ORIGIN,
            "Content-Type": "application/json",
            ...(cookieJar ? { Cookie: cookieJar } : {}),
            ...extra,
        },
        signal: AbortSignal.timeout(15000),
        dispatcher: sslBypassAgent,
    };
}

function sanitizeId(id) {
    return String(id).replace(/[^a-zA-Z0-9\-_]/g, "_").slice(0, 64);
}

function extractPath(gcsUrl) {
    if (!gcsUrl || !gcsUrl.startsWith(BUCKET_BASE)) return null;
    const rawPath = gcsUrl.slice(BUCKET_BASE.length);
    return encodeURIComponent(rawPath);
}

async function getSignedUrl(filePath) {
    const res = await undiciFetch(`${API_BASE}/file/public/signed-url/bulk`, {
        method: "POST",
        ...makeFetchOpts(),
        body: JSON.stringify({ paths: [filePath] }),
    });

    if (!res.ok) throw new Error(`Signed URL API: HTTP ${res.status}`);

    const body = await res.json();
    if (body.code !== 200 || !body.data?.[0]?.url) {
        throw new Error(`Signed URL API: unexpected response`);
    }

    return {
        url: body.data[0].url,
        expiresAt: body.data[0].expired_at,
    };
}

async function downloadPdf(signedUrl, dest) {
    const res = await undiciFetch(signedUrl, {
        headers: {
            "User-Agent": BIMA_UA,
            "Accept": "application/pdf,image/webp,*/*",
            "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
            "Referer": `${PORTAL_ORIGIN}/`,
        },
        signal: AbortSignal.timeout(30000),
        dispatcher: sslBypassAgent,
    });

    if (!res.ok) throw new Error(`Download: HTTP ${res.status}`);

    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 100) throw new Error(`Download: response too small (${buf.length} bytes)`);

    writeFileSync(dest, buf);
    return buf.length;
}

async function fetchItem(itemId) {
    const res = await undiciFetch(`${API_BASE}/pengumuman/${itemId}`, makeFetchOpts());
    if (!res.ok) return null;
    const body = await res.json();
    if (body.code !== 200 || !body.data) return null;
    return body.data;
}

async function main() {
    mkdirSync(OUT_DIR, { recursive: true });

    console.log("Fetching BIMA item list...");
    await ensureCookie();

    const listRes = await undiciFetch(
        `${API_BASE}/pengumuman?sort=tgl_created:desc&criteria=is_deleted:false,type:pengumuman&page=1:20`,
        makeFetchOpts()
    );
    const listBody = await listRes.json();
    if (listBody.code !== 200 || !Array.isArray(listBody.data)) {
        console.error("[FAIL] Unexpected list response");
        process.exit(0);
    }

    // Filter items that have files
    const itemsWithFiles = [];
    for (const item of listBody.data) {
        const detail = await fetchItem(item.id);
        if (detail?.files?.length > 0) {
            itemsWithFiles.push(detail);
        }
    }

    console.log(`${itemsWithFiles.length} items with files\n`);

    let newCount = 0, skipCount = 0, failCount = 0;

    for (const item of itemsWithFiles) {
        for (const file of item.files) {
            const fileId = file.id;
            const bimaId = sanitizeId(fileId);
            const dest = path.join(OUT_DIR, bimaId + ".pdf");

            if (existsSync(dest) && statSync(dest).size > 1000) {
                console.log(`[SKIP] ${file.nama}`);
                skipCount++;
                continue;
            }

            const filePath = extractPath(file.url);
            if (!filePath) {
                console.error(`[FAIL] ${file.nama} — cannot extract path from URL`);
                failCount++;
                continue;
            }

            console.log(`Downloading ${file.nama}...`);

            try {
                const signed = await getSignedUrl(filePath);
                console.log(`  → signed URL expires: ${signed.expiresAt}`);

                const bytes = await downloadPdf(signed.url, dest);
                console.log(`[NEW]  ${bimaId}.pdf (${(bytes / 1024).toFixed(1)} KB)`);
                newCount++;
            } catch (err) {
                console.error(`[FAIL] ${file.nama} — ${err.message}`);
                failCount++;
            }

            // Polite delay between downloads
            await new Promise((r) => setTimeout(r, 500));
        }
    }

    console.log(`\nDone. New: ${newCount} | Skipped: ${skipCount} | Failed: ${failCount}`);
}

main().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
});

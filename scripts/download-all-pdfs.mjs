#!/usr/bin/env node

import * as cheerio from "cheerio";
import { writeFileSync, existsSync, mkdirSync, statSync } from "fs";
import { Agent, fetch as undiciFetch } from "undici";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PDFS_DIR = path.join(__dirname, "../public/pdfs");

// ─── Shared helpers ───────────────────────────────────────────────────────────

function sanitizeId(id) {
    return String(id).replace(/[^a-zA-Z0-9\-_]/g, "_").slice(0, 64);
}

async function downloadPdf(url, dest, referer, useSslBypass = false) {
    const opts = {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            "Accept": "application/pdf,image/webp,*/*",
            "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
            "Referer": referer,
        },
        signal: AbortSignal.timeout(30000),
    };
    if (useSslBypass) {
        const agent = new Agent({ connect: { rejectUnauthorized: false } });
        opts.dispatcher = agent;
    }
    const res = await undiciFetch(url, opts);
    if (!res.ok) throw new Error(`Download: HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 100) throw new Error(`Download: response too small (${buf.length} bytes)`);
    writeFileSync(dest, buf);
    return buf.length;
}

async function runSource(label, fn) {
    console.log(`\n═══════════════════════════════════════════`);
    console.log(`  ${label}`);
    console.log(`═══════════════════════════════════════════\n`);
    try {
        const { new: n, skip: s, fail: f } = await fn();
        console.log(`\n  ${label} — New: ${n} | Skipped: ${s} | Failed: ${f}`);
    } catch (err) {
        console.error(`  ${label} — FATAL: ${err.message}`);
    }
}

// ─── BIMA ─────────────────────────────────────────────────────────────────────

async function downloadBimaPdfs() {
    const OUT_DIR = path.join(PDFS_DIR, "bima");
    const API_BASE = "https://apibima.kemdiktisaintek.go.id/api/v1";
    const PORTAL_ORIGIN = "https://bima.kemdiktisaintek.go.id";
    const BUCKET_BASE = "https://storage.googleapis.com/sipp-be-files/";
    const sslBypassAgent = new Agent({ connect: { rejectUnauthorized: false } });

    const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";
    let cookieJar = null;

    async function ensureCookie() {
        if (cookieJar) return;
        try {
            const res = await undiciFetch(PORTAL_ORIGIN, {
                headers: {
                    "User-Agent": UA,
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
                },
                signal: AbortSignal.timeout(8000),
                dispatcher: sslBypassAgent,
            });
            const setCookie = res.headers.get("set-cookie");
            if (setCookie) cookieJar = setCookie.split(";")[0];
        } catch { /* proceed without cookie */ }
    }

    function makeFetchOpts(extra = {}) {
        return {
            headers: {
                "User-Agent": UA,
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

    function extractPath(gcsUrl) {
        if (!gcsUrl || !gcsUrl.startsWith(BUCKET_BASE)) return null;
        return encodeURIComponent(gcsUrl.slice(BUCKET_BASE.length));
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

    async function fetchItem(itemId) {
        const res = await undiciFetch(`${API_BASE}/pengumuman/${itemId}`, makeFetchOpts());
        if (!res.ok) return null;
        const body = await res.json();
        if (body.code !== 200 || !body.data) return null;
        return body.data;
    }

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
        return { new: 0, skip: 0, fail: 0 };
    }

    const itemsWithFiles = [];
    for (const item of listBody.data) {
        const detail = await fetchItem(item.id);
        if (detail?.files?.length > 0) {
            itemsWithFiles.push(detail);
        }
    }

    console.log(`${itemsWithFiles.length} items with files`);

    let newCount = 0, skipCount = 0, failCount = 0;

    for (const item of itemsWithFiles) {
        for (const file of item.files) {
            const bimaId = sanitizeId(file.id);
            const dest = path.join(OUT_DIR, bimaId + ".pdf");

            if (existsSync(dest) && statSync(dest).size > 1000) {
                console.log(`  [SKIP] ${file.nama}`);
                skipCount++;
                continue;
            }

            const filePath = extractPath(file.url);
            if (!filePath) {
                console.error(`  [FAIL] ${file.nama} — cannot extract path from URL`);
                failCount++;
                continue;
            }

            console.log(`  Downloading ${file.nama}...`);
            try {
                const signed = await getSignedUrl(filePath);
                const bytes = await downloadPdf(signed.url, dest, `${PORTAL_ORIGIN}/`, true);
                console.log(`  [NEW]  ${bimaId}.pdf (${(bytes / 1024).toFixed(1)} KB)`);
                newCount++;
            } catch (err) {
                console.error(`  [FAIL] ${file.nama} — ${err.message}`);
                failCount++;
            }

            await new Promise((r) => setTimeout(r, 500));
        }
    }

    return { new: newCount, skip: skipCount, fail: failCount };
}

// ─── Hiliriset ────────────────────────────────────────────────────────────────

async function downloadHilirisetPdfs() {
    const OUT_DIR = path.join(PDFS_DIR, "hiliriset");
    const BASE = "https://hiliriset.kemdiktisaintek.go.id";
    const LIST_URL = `${BASE}/pengumuman?sort=published_at%7Cdesc`;

    function parseDataPage(html) {
        const match = html.match(/data-page="([^"]+)"/);
        if (!match) return null;
        const raw = match[1]
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&amp;/g, "&");
        return JSON.parse(raw);
    }

    mkdirSync(OUT_DIR, { recursive: true });

    console.log("Fetching Hiliriset announcement list...");
    const res = await undiciFetch(LIST_URL, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        },
        signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
        console.error(`[FAIL] List fetch: HTTP ${res.status}`);
        return { new: 0, skip: 0, fail: 0 };
    }

    const html = await res.text();
    let data;
    try { data = parseDataPage(html); }
    catch (err) {
        console.error("[FAIL] Could not parse data-page:", err.message);
        return { new: 0, skip: 0, fail: 0 };
    }

    const items = data?.props?.contents?.data ?? [];
    console.log(`${items.length} items found`);

    let newCount = 0, skipCount = 0, failCount = 0;

    for (const item of items) {
        const attachments = item.attachments ?? [];
        if (attachments.length === 0) continue;

        for (const file of attachments) {
            const fileId = sanitizeId(item.id);
            const dest = path.join(OUT_DIR, fileId + ".pdf");

            if (existsSync(dest) && statSync(dest).size > 1000) {
                console.log(`  [SKIP] ${file.name ?? fileId}`);
                skipCount++;
                continue;
            }

            const fileUrl = file.url;
            if (!fileUrl) {
                console.error(`  [FAIL] ${file.name ?? fileId} — no URL`);
                failCount++;
                continue;
            }

            console.log(`  Downloading ${file.name ?? fileId}...`);
            try {
                const bytes = await downloadPdf(fileUrl, dest, `${BASE}/`);
                console.log(`  [NEW]  ${fileId}.pdf (${(bytes / 1024).toFixed(1)} KB)`);
                newCount++;
            } catch (err) {
                console.error(`  [FAIL] ${file.name ?? fileId} — ${err.message}`);
                failCount++;
            }

            await new Promise((r) => setTimeout(r, 500));
        }
    }

    return { new: newCount, skip: skipCount, fail: failCount };
}

// ─── BRIN ─────────────────────────────────────────────────────────────────────

async function downloadBrinPdfs() {
    const OUT_DIR = path.join(PDFS_DIR, "brin");
    const BRIN_URL = "https://pendanaan-risnov.brin.go.id/pendanaan";

    mkdirSync(OUT_DIR, { recursive: true });

    console.log("Fetching BRIN announcement list...");
    const res = await undiciFetch(BRIN_URL, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        },
        signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
        console.error(`[FAIL] List fetch: HTTP ${res.status}`);
        return { new: 0, skip: 0, fail: 0 };
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const items = [];

    $("#daftar-pengumuman tbody tr.pengumuman-box").each((_, el) => {
        if (items.length >= 20) return false;
        const $el = $(el);
        const $content = $el.find("td").eq(1);
        const title = $content.find(".pengumuman-judul").first().text().trim();
        if (!title) return;
        const pdfLink = $content.find(".pengumuman-dokumen li a").first().attr("href");
        if (!pdfLink) return;
        items.push({ title, pdfLink });
    });

    console.log(`${items.length} items with PDFs found`);

    let newCount = 0, skipCount = 0, failCount = 0;

    for (const item of items) {
        const fileId = sanitizeId(item.title).slice(0, 48);
        const dest = path.join(OUT_DIR, fileId + ".pdf");

        if (existsSync(dest) && statSync(dest).size > 1000) {
            console.log(`  [SKIP] ${item.title}`);
            skipCount++;
            continue;
        }

        console.log(`  Downloading ${item.title}...`);
        try {
            const bytes = await downloadPdf(item.pdfLink, dest, `${BRIN_URL}/`);
            console.log(`  [NEW]  ${fileId}.pdf (${(bytes / 1024).toFixed(1)} KB)`);
            newCount++;
        } catch (err) {
            console.error(`  [FAIL] ${item.title} — ${err.message}`);
            failCount++;
        }

        await new Promise((r) => setTimeout(r, 500));
    }

    return { new: newCount, skip: skipCount, fail: failCount };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log(`╔══════════════════════════════════════════╗`);
    console.log(`║     Download All PDFs                    ║`);
    console.log(`╚══════════════════════════════════════════╝`);

    await runSource("BIMA", downloadBimaPdfs);
    await runSource("Hiliriset", downloadHilirisetPdfs);
    await runSource("BRIN", downloadBrinPdfs);

    console.log(`\n═══ All done. ═══`);
}

main().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
});

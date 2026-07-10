#!/usr/bin/env node
/**
 * BIMA PDF Downloader
 * Downloads PDFs from BIMA API and saves to public/pdfs/bima/
 * Run: node scripts/download-bima-pdfs.mjs
 *   or: npm run sync-pdfs
 */

import { writeFileSync, existsSync, mkdirSync } from "fs";
import { Agent, fetch as undiciFetch } from "undici";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "../public/pdfs/bima");
const API_URL = "https://apibima.kemdiktisaintek.go.id/api/v1/pengumuman";

// BIMA API uses a certificate that Node's default trust store can't verify
const sslBypassAgent = new Agent({ connect: { rejectUnauthorized: false } });

function sanitizeId(id) {
    return String(id).replace(/[^a-zA-Z0-9\-_]/g, "_").slice(0, 64);
}

async function fetchBimaItems() {
    const res = await undiciFetch(API_URL, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; FAST-UNSIL-bot/1.0)" },
        signal: AbortSignal.timeout(12000),
        dispatcher: sslBypassAgent,
    });
    if (!res.ok) throw new Error(`BIMA API returned ${res.status}`);
    const body = await res.json();
    if (body.code !== 200 || !Array.isArray(body.data)) throw new Error("Unexpected BIMA API response");
    return body.data;
}

async function downloadPdf(url, dest) {
    const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(dest, buf);
}

async function main() {
    mkdirSync(OUT_DIR, { recursive: true });

    console.log("Fetching BIMA announcements...");
    let items;
    try {
        items = await fetchBimaItems();
    } catch (err) {
        console.error(`[FAIL] Could not fetch BIMA API: ${err.message}`);
        process.exit(0);
    }

    let newCount = 0;
    let skipCount = 0;
    let failCount = 0;

    for (const item of items) {
        const pdfUrl = item.files?.[0]?.url;
        if (!pdfUrl) continue;

        const filename = sanitizeId(item.id) + ".pdf";
        const dest = path.join(OUT_DIR, filename);

        if (existsSync(dest)) {
            console.log(`[SKIP] ${filename}`);
            skipCount++;
            continue;
        }

        try {
            await downloadPdf(pdfUrl, dest);
            console.log(`[NEW]  ${filename} — ${item.judul?.slice(0, 60) ?? ""}`);
            newCount++;
        } catch (err) {
            console.error(`[FAIL] ${filename} — ${err.message}`);
            failCount++;
        }
    }

    console.log(`\nDone. New: ${newCount} | Skipped: ${skipCount} | Failed: ${failCount}`);
}

main();

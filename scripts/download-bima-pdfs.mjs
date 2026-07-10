#!/usr/bin/env node
/**
 * BIMA PDF Downloader (Playwright)
 * Simulates browser click on BIMA download buttons to bypass S3 presigned URL restrictions.
 * Run: node scripts/download-bima-pdfs.mjs
 *   or: npm run sync-pdfs
 *
 * One-time setup:
 *   npx playwright install chromium
 *   npx playwright install-deps chromium  # Linux only
 */

import { chromium } from "playwright";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { Agent, fetch as undiciFetch } from "undici";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "../public/pdfs/bima");
const API_URL = "https://apibima.kemdiktisaintek.go.id/api/v1/pengumuman";
const BIMA_PAGE = "https://bima.kemdiktisaintek.go.id/pengumuman";

// BIMA API uses a certificate that Node's default trust store can't verify
const sslBypassAgent = new Agent({ connect: { rejectUnauthorized: false } });

function sanitizeId(id) {
    return String(id).replace(/[^a-zA-Z0-9\-_]/g, "_").slice(0, 64);
}

function extractS3Key(url) {
    try { return new URL(url).pathname; } catch { return null; }
}

async function buildKeyMap() {
    const res = await undiciFetch(API_URL, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; FAST-UNSIL-bot/1.0)" },
        signal: AbortSignal.timeout(12000),
        dispatcher: sslBypassAgent,
    });
    if (!res.ok) throw new Error(`BIMA API returned ${res.status}`);
    const body = await res.json();
    if (body.code !== 200 || !Array.isArray(body.data)) throw new Error("Unexpected BIMA API response");

    // Map: S3 path (without query params) → sanitized BIMA item ID
    // S3 key is stable across presigned URL rotations, so we use it for matching
    const map = new Map();
    for (const item of body.data) {
        const url = item.files?.[0]?.url;
        if (url) map.set(extractS3Key(url), sanitizeId(item.id));
    }
    return map;
}

async function main() {
    mkdirSync(OUT_DIR, { recursive: true });

    console.log("Fetching BIMA item list from API...");
    let keyMap;
    try {
        keyMap = await buildKeyMap();
    } catch (err) {
        console.error(`[FAIL] Could not fetch BIMA API: ${err.message}`);
        process.exit(0);
    }
    console.log(`Found ${keyMap.size} items with PDF files`);

    if (keyMap.size === 0) {
        console.log("Nothing to download.");
        return;
    }

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    let newCount = 0, skipCount = 0, failCount = 0;

    // Intercept all responses — capture any PDF by content-type or URL pattern
    await page.route("**", async (route) => {
        let response;
        try {
            response = await route.fetch();
        } catch {
            await route.abort();
            return;
        }

        const ct = response.headers()["content-type"] ?? "";
        const reqUrl = route.request().url();
        const isPdf = ct.includes("pdf") || ct.includes("octet-stream") || reqUrl.includes(".pdf");

        if (isPdf) {
            const s3Key = extractS3Key(reqUrl);
            const bimaId = keyMap.get(s3Key);
            if (bimaId) {
                const dest = path.join(OUT_DIR, bimaId + ".pdf");
                if (existsSync(dest)) {
                    console.log(`[SKIP] ${bimaId}.pdf`);
                    skipCount++;
                } else {
                    try {
                        writeFileSync(dest, Buffer.from(await response.body()));
                        console.log(`[NEW]  ${bimaId}.pdf`);
                        newCount++;
                    } catch (err) {
                        console.error(`[FAIL] ${bimaId}.pdf — ${err.message}`);
                        failCount++;
                    }
                }
            }
        }

        try {
            await route.fulfill({ response });
        } catch {
            // page may have navigated away
        }
    });

    console.log(`Opening ${BIMA_PAGE}...`);
    try {
        await page.goto(BIMA_PAGE, { waitUntil: "networkidle", timeout: 30000 });
    } catch (err) {
        console.error(`[FAIL] Could not load BIMA page: ${err.message}`);
        await browser.close();
        process.exit(0);
    }

    // Try multiple selector patterns for download buttons (BIMA is a Vue SPA)
    const SELECTORS = [
        "a[href*='.pdf']",
        "button:has-text('Unduh')",
        "a:has-text('Unduh')",
        "button:has-text('Download')",
        "a:has-text('Download')",
        "a[download]",
    ];

    let totalClicked = 0;
    for (const selector of SELECTORS) {
        const btns = page.locator(selector);
        const count = await btns.count();
        if (count === 0) continue;
        console.log(`Clicking ${count} button(s) matching "${selector}"...`);

        for (let i = 0; i < count; i++) {
            try {
                await btns.nth(i).click({ timeout: 5000 });
                await page.waitForTimeout(800);
                totalClicked++;
            } catch (err) {
                console.error(`[FAIL] ${selector}[${i}]: ${err.message}`);
                failCount++;
            }
        }
    }

    if (totalClicked === 0) {
        console.log("No download buttons found — check selectors against current BIMA page structure.");
    }

    await browser.close();
    console.log(`\nDone. New: ${newCount} | Skipped: ${skipCount} | Failed: ${failCount}`);
}

main();

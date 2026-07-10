#!/usr/bin/env node
/**
 * BIMA Portal RECONNAISSANCE
 * Opens a visible browser to observe SPA behavior.
 * Intercepts ALL network requests and dumps everything.
 *
 * Run: node scripts/recon-bima.mjs
 */

import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "recon-output");
mkdirSync(OUT_DIR, { recursive: true });

const BIMA_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";
const PORTAL = "https://bima.kemdiktisaintek.go.id";
const API_BASE = "https://apibima.kemdiktisaintek.go.id";
const ITEM_ID = "41d5d341-557e-4d5d-a9d8-993a8a3a06b7";

// ─── Recon ──────────────────────────────────────────────────────────────

async function recon() {
    const browser = await chromium.launch({
        headless: false,  // WATCH the browser!
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-blink-features=AutomationControlled",
        ],
    });

    const context = await browser.newContext({
        userAgent: BIMA_UA,
        locale: "id-ID",
        viewport: { width: 1280, height: 900 },
        timezoneId: "Asia/Jakarta",
        deviceScaleFactor: 1,
    });

    const page = await context.newPage();

    // ── Stealth init ──
    await page.addInitScript(() => {
        Object.defineProperty(navigator, "webdriver", { get: () => false });
        Object.defineProperty(navigator, "languages", { get: () => ["id-ID", "id", "en-US", "en"] });
        Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
    });

    // ── Network log ──
    const requests = [];

    page.on("request", (req) => {
        requests.push({
            id: req.url(),
            method: req.method(),
            url: req.url(),
            resourceType: req.resourceType(),
            headers: req.headers(),
            postData: req.postData()?.slice(0, 500) || null,
        });
    });

    page.on("response", async (res) => {
        const url = res.url();
        const ct = res.headers()["content-type"] || "";
        const status = res.status();
        const isApi = url.includes("apibima") || url.includes("storage.googleapis") || url.includes("bima.");
        const isBinary = ct.includes("pdf") || ct.includes("octet-stream") || ct.includes("binary");

        if (isApi || isBinary || status >= 400) {
            let bodyPreview = null;
            try {
                if (ct.includes("json")) {
                    bodyPreview = JSON.stringify(await res.json()).slice(0, 500);
                } else if (isBinary) {
                    const buf = await res.body();
                    bodyPreview = `[BINARY ${buf.length} bytes]`;
                } else {
                    bodyPreview = (await res.text()).slice(0, 300);
                }
            } catch { bodyPreview = "[unreadable]"; }

            const entry = {
                url,
                status,
                contentType: ct,
                headers: res.headers(),
                body: bodyPreview,
            };

            // Write each API response to a file
            const safeName = url.replace(/[^a-zA-Z0-9]/g, "_").slice(-80);
            writeFileSync(path.join(OUT_DIR, `response_${safeName}.json`), JSON.stringify(entry, null, 2));

            console.log(`\n[${status}] ${url}`);
            console.log(`  Type: ${ct}`);
            console.log(`  Body: ${bodyPreview.slice(0, 200)}`);
        }
    });

    // ── Step 1: Visit portal home ──
    console.log("\n=== STEP 1: Visit portal home ===");
    await page.goto(PORTAL, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(3000);

    // ── Step 2: Dump cookies + storage ──
    console.log("\n=== COOKIES ===");
    const cookies = await context.cookies();
    cookies.forEach((c) => console.log(`  ${c.name}=${c.value.slice(0, 60)} (${c.domain})`));

    console.log("\n=== localStorage ===");
    const ls = await page.evaluate(() => {
        const items = {};
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            const v = localStorage.getItem(k);
            if (v && (k.toLowerCase().includes("token") || k.toLowerCase().includes("jwt") || v.startsWith("eyJ"))) {
                items[k] = v.slice(0, 200);
            }
        }
        return items;
    }).catch(() => ({}));
    Object.entries(ls).forEach(([k, v]) => console.log(`  ${k}=${v}`));

    console.log("\n=== sessionStorage ===");
    const ss = await page.evaluate(() => {
        const items = {};
        for (let i = 0; i < sessionStorage.length; i++) {
            const k = sessionStorage.key(i);
            const v = sessionStorage.getItem(k);
            if (v && (k.toLowerCase().includes("token") || k.toLowerCase().includes("jwt") || v.startsWith("eyJ"))) {
                items[k] = v.slice(0, 200);
            }
        }
        return items;
    }).catch(() => ({}));
    Object.entries(ss).forEach(([k, v]) => console.log(`  ${k}=${v}`));

    // ── Step 3: Navigate to announcement page ──
    console.log(`\n=== STEP 3: Visit announcement ${ITEM_ID} ===`);
    await page.goto(`${PORTAL}/pengumuman/${ITEM_ID}`, {
        waitUntil: "networkidle",
        timeout: 30000,
    });
    await page.waitForTimeout(5000);

    // Screenshot
    await page.screenshot({ path: path.join(OUT_DIR, "announcement.png"), fullPage: true });
    console.log("  → screenshot saved");

    // ── Step 4: Map ALL interactive elements ──
    console.log(`\n=== STEP 4: Map interactive elements ===`);
    const elements = await page.evaluate(() => {
        const results = [];
        const all = document.querySelectorAll("*");
        for (const el of all) {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) continue;
            const style = window.getComputedStyle(el);
            if (style.display === "none" || style.visibility === "hidden") continue;

            const tag = el.tagName.toLowerCase();
            const text = el.textContent.trim();
            if (!text && tag !== "button" && tag !== "a" && !el.getAttribute("aria-label")) continue;
            if (text.length > 100) continue;

            const relevant =
                text.toLowerCase().includes("unduh") ||
                text.toLowerCase().includes("download") ||
                text.toLowerCase().includes("pdf") ||
                text.toLowerCase().includes("file") ||
                text.toLowerCase().includes("lampir") ||
                text.toLowerCase().includes("buka") ||
                text.toLowerCase().includes("lihat") ||
                text.toLowerCase().includes("simpan") ||
                tag === "button" ||
                tag === "a" ||
                el.getAttribute("role") === "button" ||
                el.getAttribute("onclick");

            if (relevant) {
                results.push({
                    tag,
                    text: text.slice(0, 100),
                    className: (el.className || "").slice(0, 80),
                    id: el.id,
                    href: el.href?.slice(0, 200) || "",
                    onclick: (el.getAttribute("onclick") || "").slice(0, 100),
                    role: el.getAttribute("role") || "",
                    dataset: JSON.stringify(Object.fromEntries(
                        Object.entries(el.dataset).map(([k, v]) => [k, String(v).slice(0, 50)])
                    )).slice(0, 200),
                    rect: `${Math.round(rect.left)},${Math.round(rect.top)} ${Math.round(rect.width)}x${Math.round(rect.height)}`,
                });
            }
        }
        return results;
    });

    console.log(`  Found ${elements.length} interactive elements:`);
    elements.forEach((e, i) => {
        console.log(`  [${i}] <${e.tag}> "${e.text}" class="${e.className}"`);
        if (e.href) console.log(`       href: ${e.href}`);
        if (e.onclick) console.log(`       onclick: ${e.onclick}`);
        if (e.dataset && e.dataset !== "{}") console.log(`       data: ${e.dataset}`);
    });

    // ── Step 5: Try clicking elements ──
    console.log(`\n=== STEP 5: Try clicking download-related elements ===`);

    // Set up download event listener
    let capturedDownload = null;
    page.on("download", (d) => {
        capturedDownload = d;
        console.log(`\n*** DOWNLOAD EVENT: ${d.url()} -> ${d.suggestedFilename()} ***`);
    });

    // Try clicking elements with "unduh" text
    for (let attempt = 0; attempt < 3; attempt++) {
        console.log(`\n--- Click attempt ${attempt + 1} ---`);

        // Clear previous download
        capturedDownload = null;

        // Try clicking by text
        const clicked = await page.evaluate(() => {
            // Try various text patterns
            const patterns = ["unduh", "download", "pdf", "lampiran", "buka", "lihat file"];

            // Try matching elements by text content
            const all = document.querySelectorAll("*");
            for (const el of all) {
                const text = el.textContent.trim().toLowerCase();
                for (const p of patterns) {
                    if (text === p || text.startsWith(p) || text.includes(p)) {
                        el.click();
                        return { tag: el.tagName, text: text.slice(0, 80), method: "text-match" };
                    }
                }
            }
            return null;
        });

        if (clicked) {
            console.log(`  Clicked: <${clicked.tag}> "${clicked.text}" (${clicked.method})`);
        }

        await page.waitForTimeout(3000);

        // Check for new pages (PDF popup)
        const pages = context.pages();
        if (pages.length > 1) {
            const popup = pages[pages.length - 1];
            console.log(`  *** NEW PAGE: ${popup.url()} ***`);
            try {
                const popupCt = await popup.evaluate(() => document.contentType).catch(() => "");
                const popupBody = await popup.evaluate(async () => {
                    const res = await fetch(window.location.href);
                    return Array.from(new Uint8Array(await res.arrayBuffer()));
                }).catch(() => null);
                console.log(`  Popup content-type: ${popupCt}`);
                console.log(`  Popup body: ${popupBody?.length || 0} bytes`);
                if (popupBody && popupBody.length > 1000) {
                    const buf = Buffer.from(popupBody);
                    writeFileSync(path.join(OUT_DIR, "downloaded.pdf"), buf);
                    console.log(`  *** PDF SAVED: ${buf.length} bytes ***`);
                }
            } catch (e) {
                console.log(`  Popup error: ${e.message}`);
            }
        }

        // Check for download event
        if (capturedDownload) {
            console.log(`  Download captured: ${capturedDownload.suggestedFilename()}`);
            const stream = await capturedDownload.createReadStream();
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            const buf = Buffer.concat(chunks);
            writeFileSync(path.join(OUT_DIR, capturedDownload.suggestedFilename()), buf);
            console.log(`  *** DOWNLOAD SAVED: ${buf.length} bytes ***`);
        }
    }

    // ── Step 6: Final network summary ──
    console.log(`\n=== NETWORK SUMMARY ===`);
    const apiCalls = requests.filter((r) => r.url.includes("apibima"));
    const gcsCalls = requests.filter((r) => r.url.includes("storage.googleapis"));
    console.log(`Total requests: ${requests.length}`);
    console.log(`API calls to apibima: ${apiCalls.length}`);
    console.log(`GCS calls: ${gcsCalls.length}`);

    apiCalls.forEach((r) => {
        console.log(`  [${r.method}] ${r.url}`);
    });

    // ── Save full log ──
    writeFileSync(path.join(OUT_DIR, "network-requests.json"), JSON.stringify(requests, null, 2));
    writeFileSync(path.join(OUT_DIR, "elements.json"), JSON.stringify(elements, null, 2));

    console.log(`\n=== RECON COMPLETE ===`);
    console.log(`Output saved to: ${OUT_DIR}`);

    // Keep browser open for manual inspection
    console.log("\nBrowser is still open. Press Ctrl+C in terminal to close.");
}

recon().catch((err) => {
    console.error("Recon failed:", err);
    process.exit(1);
});

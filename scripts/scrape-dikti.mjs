#!/usr/bin/env node
/**
 * Standalone DIKTI scraper - ampuh, retry, dedup, cache.
 * Run: node scripts/scrape-dikti.mjs
 * Requires: cheerio (already in node_modules), Node 18+
 */

import * as cheerio from "cheerio";
import { createHash } from "crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { Agent, fetch as undiciFetch } from "undici";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_FILE = path.join(__dirname, "data", "dikti-cache.json");

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

const sslBypassAgent = new Agent({ connect: { rejectUnauthorized: false } });

async function fetchWithRetry(url, opts = {}, maxRetries = 3) {
    const UA = "Mozilla/5.0 (compatible; FAST-UNSIL-bot/1.0)";
    const headers = { "User-Agent": UA, ...opts.headers };

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const signal = AbortSignal.timeout(opts.timeout ?? 12000);
            const fetchFn = opts.sslBypass ? undiciFetch : fetch;
            const res = await fetchFn(url, {
                ...opts,
                headers,
                signal,
                ...(opts.sslBypass && { dispatcher: sslBypassAgent }),
            });
            if (res.ok) return res;
            if (res.status < 500) return res; // client error — no retry
        } catch (err) {
            if (attempt === maxRetries) throw err;
        }
        // Exponential backoff: 1s, 2s, 4s
        await new Promise((r) => setTimeout(r, 1000 * 2 ** (attempt - 1)));
    }
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

const ID_MONTHS = {
    januari: 0, jan: 0, februari: 1, feb: 1, maret: 2, mar: 2,
    april: 3, apr: 3, mei: 4, juni: 5, jun: 5, juli: 6, jul: 6,
    agustus: 7, agt: 7, agu: 7, september: 8, sep: 8,
    oktober: 9, okt: 9, november: 10, nov: 10, desember: 11, des: 11,
};

function parseDate(raw) {
    if (!raw) return new Date().toISOString();
    const iso = Date.parse(raw);
    if (!isNaN(iso)) return new Date(iso).toISOString();
    const m = raw.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
    if (!m) return new Date().toISOString();
    const month = ID_MONTHS[m[2].toLowerCase()];
    if (month === undefined) return new Date().toISOString();
    return new Date(parseInt(m[3]), month, parseInt(m[1])).toISOString();
}

function stableId(source, title) {
    return `${source}-${createHash("md5").update(title).digest("hex").slice(0, 8)}`;
}

// ─── Scrapers ─────────────────────────────────────────────────────────────────

async function scrapeKemdikti() {
    const BASE = "https://kemdiktisaintek.go.id";
    const items = [];
    const READ_MORE = /selengkapnya|lihat\s*(detail|pengumuman)|baca\s*lebih|read\s*more/i;

    try {
        const res = await fetchWithRetry(`${BASE}/announcement`);
        if (!res?.ok) return [];
        const $ = cheerio.load(await res.text());

        $("a[href*='/announcement/article']").each((_, el) => {
            if (items.length >= 15) return false;
            const $el = $(el);
            const text = $el.text().trim();
            if (READ_MORE.test(text) || !text || text.length < 5) return;

            const href = $el.attr("href") ?? "";
            const link = href.startsWith("http") ? href : `${BASE}${href}`;
            const parent = $el.closest("[class]");
            const dateText = parent.find("*")
                .filter((_, e) => /\d{1,2}\s+\w+\s+\d{4}/.test($(e).text()))
                .first().text().trim();

            items.push({
                id: stableId("kemdikti", text),
                source: "Kemdiktisaintek",
                title: text,
                date: parseDate(dateText),
                link,
                pdfLink: null,
                excerpt: "",
            });
        });
    } catch { /* silent */ }
    return items;
}

async function scrapeSumberdaya() {
    const BASE = "https://sumberdayadikti.kemdiktisaintek.go.id";
    const items = [];

    try {
        const res = await fetchWithRetry(`${BASE}/web/artikel`);
        if (!res?.ok) return [];
        const $ = cheerio.load(await res.text());

        $("h3.artikel-judul").each((_, el) => {
            if (items.length >= 15) return false;
            const $h3 = $(el);
            const title = $h3.text().trim();
            if (!title || title.length < 5) return;

            const $body = $h3.next("p");
            const href = $body.find("a[href*='/web/artikel/view/']").attr("href") ?? "";
            if (!href) return;
            const link = href.startsWith("http") ? href : `${BASE}${href}`;
            const footText = $body.next("p.artikel-foot").text().trim();

            items.push({
                id: stableId("sumberdaya", title),
                source: "Direktorat Sumber Daya",
                title,
                date: parseDate(footText),
                link,
                pdfLink: null,
                excerpt: $body.clone().find("a").remove().end().text().trim().slice(0, 200),
            });
        });
    } catch { /* silent */ }
    return items;
}

async function scrapeBima() {
    const API = "https://apibima.kemdiktisaintek.go.id/api/v1/pengumuman";
    const PORTAL = "https://bima.kemdiktisaintek.go.id/pengumuman";

    try {
        const res = await fetchWithRetry(API, { sslBypass: true });
        if (!res?.ok) return [];
        const body = await res.json();
        if (body.code !== 200 || !Array.isArray(body.data)) return [];

        return body.data.slice(0, 15).map((item) => {
            const pdfLink = item.files?.[0]?.url ?? null;
            return {
                id: stableId("bima", item.judul),
                source: "BIMA",
                title: item.judul,
                date: parseDate(item.tgl_pemberitaan),
                link: pdfLink ?? PORTAL,
                pdfLink,
                excerpt: item.no_surat ? `No. ${item.no_surat}` : (item.ringkasan ?? ""),
            };
        });
    } catch { return []; }
}

async function scrapeBrin() {
    const URL = "https://pendanaan-risnov.brin.go.id/pendanaan";
    const items = [];

    try {
        const res = await fetchWithRetry(URL);
        if (!res?.ok) return [];
        const $ = cheerio.load(await res.text());

        $("#daftar-pengumuman tbody tr.pengumuman-box").each((i, el) => {
            if (items.length >= 15) return false;
            const $el = $(el);
            const tds = $el.find("td");
            const rawTs = tds.eq(0).find("span").first().text().trim();
            const ts = parseInt(rawTs, 10);
            const date = isNaN(ts) ? new Date().toISOString() : new Date(ts * 1000).toISOString();

            const $content = tds.eq(1);
            const title = $content.find(".pengumuman-judul").first().text().trim();
            if (!title) return;

            const refNum = $content.find(".pengumuman-top b").first().text().trim();
            const pdfLink = $content.find(".pengumuman-dokumen li a").first().attr("href") ?? null;

            items.push({
                id: stableId("brin", title),
                source: "BRIN Pendanaan Risnov",
                title,
                date,
                link: pdfLink ?? URL,
                pdfLink,
                excerpt: refNum ? `No. ${refNum}` : "",
            });
        });
    } catch { /* silent */ }
    return items;
}

async function scrapeHiliriset() {
    const BASE = "https://hiliriset.kemdiktisaintek.go.id";
    const URL = `${BASE}/pengumuman?sort=published_at%7Cdesc`;

    try {
        const res = await fetchWithRetry(URL);
        if (!res?.ok) return [];
        const html = await res.text();
        const match = html.match(/data-page="([^"]+)"/);
        if (!match) return [];

        const raw = match[1]
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&amp;/g, "&");
        const data = JSON.parse(raw);
        const rows = data.props?.contents?.data ?? [];

        return rows.slice(0, 15).map((item) => {
            const pdfLink = item.attachments?.[0]?.url ?? null;
            return {
                id: stableId("hiliriset", item.title),
                source: "Hiliriset",
                title: item.title,
                date: parseDate(item.published_at),
                link: pdfLink ?? `${BASE}/pengumuman`,
                pdfLink,
                excerpt: item.document_number ? `No. ${item.document_number}` : "",
            };
        });
    } catch { return []; }
}

// Simlitabmas - research grant announcements
async function scrapeSimlitabmas() {
    const BASE = "https://simlitabmas.kemdiktisaintek.go.id";
    const items = [];

    try {
        const res = await fetchWithRetry(`${BASE}/pengumuman`, { timeout: 15000 });
        if (!res?.ok) return [];
        const $ = cheerio.load(await res.text());

        // Try common patterns for announcement listings
        $("a[href*='pengumuman']").each((_, el) => {
            if (items.length >= 10) return false;
            const $el = $(el);
            const title = $el.text().trim();
            if (!title || title.length < 10 || /pengumuman$/i.test(title)) return;

            const href = $el.attr("href") ?? "";
            const link = href.startsWith("http") ? href : `${BASE}${href}`;

            const parent = $el.closest("li, tr, .card, .item, article");
            const dateText = parent.find("time, [class*='date'], [class*='tgl']").first().text().trim();

            items.push({
                id: stableId("simlitabmas", title),
                source: "Simlitabmas",
                title,
                date: parseDate(dateText),
                link,
                pdfLink: null,
                excerpt: "",
            });
        });
    } catch { /* site may be unavailable */ }
    return items;
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

export async function fetchDikti() {
    console.log("⏳ Fetching DIKTI data from all sources...\n");

    const results = await Promise.allSettled([
        scrapeKemdikti(),
        scrapeSumberdaya(),
        scrapeBima(),
        scrapeBrin(),
        scrapeHiliriset(),
        scrapeSimlitabmas(),
    ]);

    const sourceNames = [
        "Kemdiktisaintek", "Sumber Daya", "BIMA", "BRIN", "Hiliriset", "Simlitabmas"
    ];

    const all = [];
    results.forEach((r, i) => {
        if (r.status === "fulfilled") {
            console.log(`  ✓ ${sourceNames[i]}: ${r.value.length} items`);
            all.push(...r.value);
        } else {
            console.log(`  ✗ ${sourceNames[i]}: FAILED — ${r.reason?.message}`);
        }
    });

    // Dedup by stable ID
    const seen = new Set();
    const deduped = all.filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
    });

    // Sort newest first
    deduped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    console.log(`\n📊 Total: ${all.length} raw → ${deduped.length} after dedup`);
    return deduped;
}

// ─── Cache helpers ────────────────────────────────────────────────────────────

function loadCache() {
    if (!existsSync(CACHE_FILE)) return [];
    try { return JSON.parse(readFileSync(CACHE_FILE, "utf8")); }
    catch { return []; }
}

function saveCache(items) {
    mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    writeFileSync(CACHE_FILE, JSON.stringify(items, null, 2), "utf8");
}

function findNew(current, previous) {
    const prevIds = new Set(previous.map((i) => i.id));
    return current.filter((i) => !prevIds.has(i.id));
}

// ─── CLI runner ───────────────────────────────────────────────────────────────

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const prev = loadCache();
    const items = await fetchDikti();
    const newItems = findNew(items, prev);

    if (newItems.length > 0) {
        console.log(`\n🆕 ${newItems.length} new item(s) since last run:\n`);
        newItems.forEach((item) => {
            const d = new Date(item.date).toLocaleDateString("id-ID", {
                day: "numeric", month: "short", year: "numeric",
            });
            console.log(`  [${item.source}] ${d}`);
            console.log(`  ${item.title}`);
            if (item.link) console.log(`  → ${item.link}`);
            console.log();
        });
    } else {
        console.log("\n✅ No new items since last run.");
    }

    saveCache(items);
    console.log(`💾 Cache saved → ${CACHE_FILE}`);
}

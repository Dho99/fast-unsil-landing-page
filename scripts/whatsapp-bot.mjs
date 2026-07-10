#!/usr/bin/env node
/**
 * WhatsApp Business Cloud API — auto-notify info terbaru DIKTI.
 *
 * Setup (sekali):
 *   1. Buat app di https://developers.facebook.com/
 *   2. Tambahkan produk "WhatsApp Business"
 *   3. Ambil Phone Number ID + Permanent Access Token dari Meta Developer Console
 *   4. Salin .env.bot.example → .env.bot lalu isi nilainya
 *
 * Install deps:
 *   npm install node-cron dotenv
 *
 * Jalankan:
 *   node scripts/whatsapp-bot.mjs
 *
 * ✅ Official API — aman, tidak melanggar ToS Meta.
 */

import cron from "node-cron";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { fetchDikti } from "./scrape-dikti.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Load env ─────────────────────────────────────────────────────────────────

const ENV_FILE = path.join(__dirname, "..", ".env.bot");
if (existsSync(ENV_FILE)) {
    readFileSync(ENV_FILE, "utf8")
        .split("\n")
        .forEach((line) => {
            const [key, ...val] = line.replace(/#.*/g, "").trim().split("=");
            if (key && val.length) process.env[key.trim()] = val.join("=").trim();
        });
}

// ─── Konfigurasi ──────────────────────────────────────────────────────────────

const ACCESS_TOKEN = process.env.WA_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID;
const TARGET_NUMBER = process.env.WA_TARGET_NUMBER ?? "628517974009"; // +62 851-7974-9009
const API_VERSION = "v20.0";
const API_URL = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`;

const CHECK_INTERVAL = process.env.BOT_CRON ?? "0 * * * *"; // tiap jam
// Alternatif: "0 8,12,17 * * *" → 3x sehari
//             "0 */2 * * *"      → tiap 2 jam

const MAX_ITEMS_PER_MSG = 5;
const SENT_FILE = path.join(__dirname, "data", "sent-ids.json");

// ─── Guard: cek env vars ──────────────────────────────────────────────────────

function assertEnv() {
    const missing = [];
    if (!ACCESS_TOKEN) missing.push("WA_ACCESS_TOKEN");
    if (!PHONE_NUMBER_ID) missing.push("WA_PHONE_NUMBER_ID");
    if (missing.length) {
        console.error(`\n❌ Env vars belum diisi: ${missing.join(", ")}`);
        console.error(`   Salin .env.bot.example → .env.bot lalu isi nilainya.\n`);
        process.exit(1);
    }
}

// ─── Persistence ──────────────────────────────────────────────────────────────

function loadSentIds() {
    if (!existsSync(SENT_FILE)) return new Set();
    try {
        const data = JSON.parse(readFileSync(SENT_FILE, "utf8"));
        return new Set(Array.isArray(data) ? data : []);
    } catch { return new Set(); }
}

function saveSentIds(ids) {
    mkdirSync(path.dirname(SENT_FILE), { recursive: true });
    writeFileSync(SENT_FILE, JSON.stringify([...ids].slice(-1000), null, 2), "utf8");
}

// ─── Format pesan ─────────────────────────────────────────────────────────────

function formatDate(iso) {
    return new Date(iso).toLocaleDateString("id-ID", {
        weekday: "short", day: "numeric", month: "short", year: "numeric",
    });
}

function buildMessage(items) {
    const now = new Date().toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });

    const lines = [
        `🔔 *INFO DIKTI TERBARU*`,
        `${now} WIB`,
        `${"─".repeat(28)}`,
    ];

    items.forEach((item, i) => {
        lines.push(`\n*${i + 1}. ${item.title}*`);
        lines.push(`🏛️ ${item.source} · ${formatDate(item.date)}`);
        if (item.excerpt) lines.push(`📄 ${item.excerpt}`);
        if (item.pdfLink) lines.push(`📎 PDF: ${item.pdfLink}`);
        else if (item.link) lines.push(`🔗 ${item.link}`);
    });

    lines.push(`\n${"─".repeat(28)}`);
    lines.push(`_Auto-notif FAST UNSIL · fast.unsil.ac.id_`);

    return lines.join("\n");
}

// ─── Kirim via Meta Cloud API ─────────────────────────────────────────────────

async function sendWhatsApp(text) {
    const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: TARGET_NUMBER,
        type: "text",
        text: {
            preview_url: false,
            body: text,
        },
    };

    const res = await fetch(API_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
        const err = json?.error;
        throw new Error(`API error ${res.status}: ${err?.message ?? JSON.stringify(json)}`);
    }

    return json;
}

// ─── Cek & kirim update ───────────────────────────────────────────────────────

async function checkAndNotify() {
    const ts = new Date().toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" });
    console.log(`\n[${ts}] Cek DIKTI...`);

    const sentIds = loadSentIds();

    let items;
    try {
        items = await fetchDikti();
    } catch (err) {
        console.error("  ❌ Fetch DIKTI gagal:", err.message);
        return;
    }

    const newItems = items.filter((i) => !sentIds.has(i.id));

    if (newItems.length === 0) {
        console.log("  ✅ Tidak ada item baru.");
        return;
    }

    console.log(`  📬 ${newItems.length} item baru — mengirim ke ${TARGET_NUMBER}...`);

    // Kirim dalam batch max MAX_ITEMS_PER_MSG
    for (let i = 0; i < newItems.length; i += MAX_ITEMS_PER_MSG) {
        const batch = newItems.slice(i, i + MAX_ITEMS_PER_MSG);
        const msg = buildMessage(batch);
        const batchNum = Math.floor(i / MAX_ITEMS_PER_MSG) + 1;

        try {
            const result = await sendWhatsApp(msg);
            const msgId = result?.messages?.[0]?.id ?? "?";
            console.log(`  ✓ Batch ${batchNum} terkirim (${batch.length} item) — msg id: ${msgId}`);
        } catch (err) {
            console.error(`  ✗ Batch ${batchNum} gagal:`, err.message);
        }

        // Jeda antar batch
        if (i + MAX_ITEMS_PER_MSG < newItems.length) {
            await new Promise((r) => setTimeout(r, 2000));
        }
    }

    newItems.forEach((i) => sentIds.add(i.id));
    saveSentIds(sentIds);
    console.log(`  💾 ${newItems.length} ID disimpan.`);
}

// ─── Entry point ──────────────────────────────────────────────────────────────

assertEnv();

console.log(`\n🤖 FAST UNSIL DIKTI Bot — WhatsApp Business API`);
console.log(`📱 Target : ${TARGET_NUMBER}`);
console.log(`⏰ Cron   : ${CHECK_INTERVAL} (Asia/Jakarta)`);
console.log(`🔢 Phone# : ${PHONE_NUMBER_ID}\n`);

// Langsung cek saat start
await checkAndNotify();

// Schedule berkala
cron.schedule(CHECK_INTERVAL, checkAndNotify, { timezone: "Asia/Jakarta" });
console.log(`\n⏳ Bot berjalan. Ctrl+C untuk berhenti.\n`);

process.on("SIGINT", () => {
    console.log("\n👋 Bot dihentikan.");
    process.exit(0);
});

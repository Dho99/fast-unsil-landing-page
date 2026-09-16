import fs from "fs";
import path from "path";

export interface PdfFile {
    id: string;
    title: string;
    filename: string;
    source: string;
    sourceDir: string;
    url: string;
    publishedAt: string;
    mtimeMs: number;
}

const DIR_TO_SOURCE: Record<string, string> = {
    bima: "BIMA",
    hiliriset: "Hiliriset",
    brin: "BRIN Pendanaan Risnov",
    arjuna: "ARJUNA",
};

const SOURCE_TO_DIR: Record<string, string> = Object.fromEntries(
    Object.entries(DIR_TO_SOURCE).map(([k, v]) => [v, k])
);

function pdfDir(dir: string): string {
    return path.join(process.cwd(), "public", "pdfs", dir);
}

function toTitle(filename: string): string {
    return filename.replace(/\.pdf$/i, "").replace(/_/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Generic filesystem reader for public/pdfs/{source}
 * - safe try/catch, return [] if folder missing
 * - not hardcoded to BRIN, works for bima/hiliriset/brin/arjuna
 */
export function getPdfFiles(sourceDir: string): PdfFile[] {
    const dirKey = sourceDir.toLowerCase();
    const source = DIR_TO_SOURCE[dirKey] ?? sourceDir;
    const dir = pdfDir(dirKey);
    try {
        if (!fs.existsSync(dir)) return [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        const files: PdfFile[] = [];
        for (const ent of entries) {
            if (!ent.isFile() || !ent.name.toLowerCase().endsWith(".pdf")) continue;
            const full = path.join(dir, ent.name);
            let stat: fs.Stats;
            try {
                stat = fs.statSync(full);
            } catch {
                continue;
            }
            if (stat.size < 100) continue;
            const publishedAt = stat.mtime.toISOString();
            files.push({
                id: `${dirKey}-${ent.name}`,
                title: toTitle(ent.name),
                filename: ent.name,
                source,
                sourceDir: dirKey,
                url: `/pdfs/${dirKey}/${encodeURIComponent(ent.name)}`,
                publishedAt,
                mtimeMs: stat.mtimeMs,
            });
        }
        files.sort((a, b) => b.mtimeMs - a.mtimeMs);
        return files;
    } catch {
        return [];
    }
}

export function getPdfIndex(): Record<string, PdfFile[]> {
    const out: Record<string, PdfFile[]> = {};
    for (const [dir, source] of Object.entries(DIR_TO_SOURCE)) {
        out[source] = getPdfFiles(dir);
    }
    return out;
}

export function getSourceDir(source: string): string | undefined {
    return SOURCE_TO_DIR[source];
}

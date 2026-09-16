import fs from "fs";
import path from "path";

/**
 * Deprecated: Previously proxied https://pendanaan-risnov.brin.go.id/pendanaan via runtime fetch.
 * VPS cannot reach BRIN (103.144.45.95:443 timeout), so crawler now runs in GitHub Actions
 * and PDFs are synced to public/pdfs/brin/*.pdf.
 *
 * This route now serves local PDFs:
 *   GET /api/brin-pdf?file=<filename.pdf>
 * Legacy ?idx= is deprecated and returns 410.
 *
 * Path traversal is validated.
 */

const BRIN_DIR = path.join(process.cwd(), "public", "pdfs", "brin");

function isSafeFilename(name: string): boolean {
    if (!name || name.includes("/") || name.includes("\\") || name.includes("..")) return false;
    if (!name.toLowerCase().endsWith(".pdf")) return false;
    // allow only safe chars (sanitized titles)
    if (!/^[a-zA-Z0-9._\-]+$/.test(name)) return false;
    return true;
}

export async function GET(request: Request) {
    const url = new URL(request.url);
    const file = url.searchParams.get("file");
    const idx = url.searchParams.get("idx");

    // Legacy idx support deprecated — instruct to use ?file=
    if (!file && idx !== null) {
        return new Response(
            JSON.stringify({
                error: "Deprecated: use ?file=<filename.pdf> instead of ?idx=. See public/pdfs/brin/",
                idx,
            }),
            { status: 410, headers: { "Content-Type": "application/json" } }
        );
    }

    if (!file) {
        return new Response(JSON.stringify({ error: "Missing ?file=<filename.pdf>" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    if (!isSafeFilename(file)) {
        return new Response(JSON.stringify({ error: "Invalid filename" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const full = path.join(BRIN_DIR, file);
    const resolved = path.resolve(full);
    const base = path.resolve(BRIN_DIR);
    if (!resolved.startsWith(base + path.sep) && resolved !== base) {
        return new Response(JSON.stringify({ error: "Path traversal blocked" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        if (!fs.existsSync(resolved)) {
            return new Response(JSON.stringify({ error: "File not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }
        const stat = fs.statSync(resolved);
        if (!stat.isFile() || stat.size < 100) {
            return new Response(JSON.stringify({ error: "Invalid file" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }
        const stream = fs.createReadStream(resolved);
        return new Response(stream as unknown as BodyInit, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="${file}"`,
                "Cache-Control": "public, max-age=86400",
                "Content-Length": String(stat.size),
            },
        });
    } catch (err) {
        console.error("[brin-pdf local]", err);
        return new Response(JSON.stringify({ error: "PDF unavailable" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

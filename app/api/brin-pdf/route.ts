import * as cheerio from "cheerio";

const BRIN_URL = "https://pendanaan-risnov.brin.go.id/pendanaan";
const BRIN_ORIGIN = "https://pendanaan-risnov.brin.go.id";

export async function GET(request: Request) {
    const idx = Number(new URL(request.url).searchParams.get("idx") ?? "0");

    try {
        const res = await fetch(BRIN_URL, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; RSS-aggregator)" },
            signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) throw new Error("list failed");

        const html = await res.text();
        const $ = cheerio.load(html);
        const pdfLinks: string[] = [];

        $("#daftar-pengumuman tbody tr.pengumuman-box").each((_, el) => {
            const $el = $(el);
            const $content = $el.find("td").eq(1);
            const title = $content.find(".pengumuman-judul").first().text().trim();
            if (!title) return;

            const link = $content
                .find(".pengumuman-dokumen li a")
                .first()
                .attr("href");
            if (link) pdfLinks.push(link);
        });

        const pdfUrl = pdfLinks[idx];
        if (!pdfUrl) throw new Error("idx out of range");

        const pdfRes = await fetch(pdfUrl, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
                Accept: "application/pdf,image/webp,*/*",
                "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
                Referer: BRIN_ORIGIN,
            },
            signal: AbortSignal.timeout(15000),
        });
        if (!pdfRes.ok) throw new Error(`S3: HTTP ${pdfRes.status}`);

        return new Response(pdfRes.body, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="brin-${idx}.pdf"`,
                "Cache-Control": "public, max-age=86400",
            },
        });
    } catch (err) {
        console.error("[brin-pdf proxy]", err);
        return new Response("PDF unavailable", { status: 502 });
    }
}

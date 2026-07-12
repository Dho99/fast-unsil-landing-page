import * as cheerio from "cheerio";

const BRIN_URL = "https://pendanaan-risnov.brin.go.id/pendanaan";

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

        return Response.redirect(pdfUrl, 302);
    } catch (err) {
        console.error("[brin-pdf proxy]", err);
        return Response.redirect(BRIN_URL, 302);
    }
}

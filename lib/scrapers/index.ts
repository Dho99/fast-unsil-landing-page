import { unstable_cache } from "next/cache";
import type { NewsArticle } from "@/lib/constants";
import { scrapeKemdikti } from "./kemdikti";
import { scrapeSumberdaya } from "./sumberdaya";
import { scrapeBrin } from "./brin";
import { parseRssFeed } from "./feeds";

// TODO: hiliriset.kemdiktisaintek.go.id/pengumuman — SPA, API endpoint unknown
// TODO: bima.kemdiktisaintek.go.id/pengumuman — SSL certificate error
// TODO: arjuna.kemdiktisaintek.go.id/#/pengumuman — SSL error + hash-based SPA routing

const CYBERSEC_FEEDS = [
    {
        url: "https://feeds.feedburner.com/TheHackersNews",
        category: "Keamanan Siber",
        categoryColor: "#DC2626",
        imagePlaceholder:
            "linear-gradient(135deg, #3b0a0a 0%, #1a0505 60%, #2a1010 100%)",
        source: "The Hacker News",
        prefix: "thn",
    },
    {
        url: "https://www.bleepingcomputer.com/feed/",
        category: "Tech & Security",
        categoryColor: "#3B82F6",
        imagePlaceholder:
            "linear-gradient(135deg, #1e3a5f 0%, #0d1b35 60%, #1a2840 100%)",
        source: "Bleeping Computer",
        prefix: "bc",
    },
    {
        url: "https://isc.sans.edu/rssfeed_full.xml",
        category: "Riset Siber",
        categoryColor: "#6366F1",
        imagePlaceholder:
            "linear-gradient(135deg, #1a1040 0%, #0d1b35 60%, #1e2a4a 100%)",
        source: "SANS Internet Storm Center",
        prefix: "sans",
    },
] as const;

async function fetchAllNewsRaw(): Promise<NewsArticle[]> {
    const results = await Promise.allSettled([
        scrapeKemdikti(),
        scrapeSumberdaya(),
        scrapeBrin(),
        ...CYBERSEC_FEEDS.map((f) => parseRssFeed(f.url, { ...f, limit: 5 })),
    ]);

    return results
        .filter(
            (r): r is PromiseFulfilledResult<NewsArticle[]> =>
                r.status === "fulfilled"
        )
        .flatMap((r) => r.value)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const fetchAllNews = unstable_cache(fetchAllNewsRaw, ["all-news"], {
    revalidate: 3600,
});

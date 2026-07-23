import { fetchAllNews } from "@/lib/scrapers";
import { buildNewsRssXml, NEWS_RSS_HEADERS } from "@/lib/rss";

export async function GET() {
    const news = await fetchAllNews();
    return new Response(buildNewsRssXml(news), { headers: NEWS_RSS_HEADERS });
}

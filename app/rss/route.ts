import { fetchAllNews } from "@/lib/scrapers";
import { buildNewsRssXml, NEWS_RSS_HEADERS } from "@/lib/rss";

export async function GET(request: Request) {
    const news = await fetchAllNews();
    const selfUrl = request.url;
    return new Response(buildNewsRssXml(news, selfUrl), {
        headers: NEWS_RSS_HEADERS,
    });
}

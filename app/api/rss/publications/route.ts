import { fetchAllPublications } from "@/lib/scrapers/publications";
import { buildPublicationsRssXml, PUBLICATIONS_RSS_HEADERS } from "@/lib/rss";

export async function GET(request: Request) {
    const publications = await fetchAllPublications();
    const selfUrl = request.url;
    return new Response(buildPublicationsRssXml(publications, selfUrl), {
        headers: PUBLICATIONS_RSS_HEADERS,
    });
}

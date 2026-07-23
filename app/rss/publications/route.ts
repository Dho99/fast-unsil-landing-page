import { fetchAllPublications } from "@/lib/scrapers/publications";
import { buildPublicationsRssXml, PUBLICATIONS_RSS_HEADERS } from "@/lib/rss";

export async function GET() {
    const publications = await fetchAllPublications();
    return new Response(buildPublicationsRssXml(publications), {
        headers: PUBLICATIONS_RSS_HEADERS,
    });
}

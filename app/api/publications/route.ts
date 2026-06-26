import { fetchAllPublications } from "@/lib/scrapers/publications";

export async function GET() {
    const publications = await fetchAllPublications();
    return Response.json(publications);
}

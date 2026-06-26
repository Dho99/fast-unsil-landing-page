import { fetchAllNews } from "@/lib/scrapers";

export async function GET() {
    const news = await fetchAllNews();
    return Response.json(news);
}

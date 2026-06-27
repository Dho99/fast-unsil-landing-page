import { fetchInfoDikti } from "@/lib/scrapers";

export async function GET() {
    const items = await fetchInfoDikti();
    return Response.json(items);
}

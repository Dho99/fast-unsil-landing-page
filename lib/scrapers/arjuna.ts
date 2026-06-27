import type { NewsArticle } from "@/lib/constants";

// Arjuna API (https://arjuna-api-zmltmhkk4a-et.a.run.app) requires auth token.
// No public endpoint available — returns empty until a public API is exposed.
export async function scrapeArjuna(): Promise<NewsArticle[]> {
    return [];
}

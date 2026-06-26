import { unstable_cache } from "next/cache";
import { PUBLICATIONS } from "@/lib/constants";
import type { Publication } from "@/lib/constants";

const ACCENT_COLORS = ["#3B82F6", "#DC2626", "#6366F1"];

// Semantic Scholar paper shape (subset of fields we request)
interface S2Paper {
    paperId: string;
    title: string;
    year: number | null;
    venue: string | null;
    authors: { name: string }[];
}

interface S2Response {
    data: S2Paper[];
}

async function fetchAuthorPapers(authorId: string): Promise<Publication[]> {
    const url =
        `https://api.semanticscholar.org/graph/v1/author/${authorId}/papers` +
        `?fields=title,year,venue,authors&limit=20&sort=year:desc`;

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];

    const json: S2Response = await res.json();
    return (json.data ?? [])
        .filter((p) => p.title && p.year)
        .map((p, i) => ({
            no: i + 1,
            title: p.title,
            authors: p.authors.map((a) => a.name).join(", "),
            venue: p.venue ?? "—",
            year: p.year ?? new Date().getFullYear(),
            accentColor: ACCENT_COLORS[i % ACCENT_COLORS.length],
            link: `https://www.semanticscholar.org/paper/${p.paperId}`,
        }));
}

async function fetchAllPublicationsRaw(): Promise<Publication[]> {
    // Provide comma-separated Semantic Scholar author IDs in env to enable live fetch.
    // Example: SEMANTICSCHOLAR_AUTHOR_IDS=1234567890,0987654321
    const envIds = process.env.SEMANTICSCHOLAR_AUTHOR_IDS ?? "";
    const authorIds = envIds
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    if (authorIds.length === 0) {
        // No author IDs configured — return hardcoded publications
        return PUBLICATIONS;
    }

    const results = await Promise.allSettled(
        authorIds.map((id) => fetchAuthorPapers(id))
    );

    const papers = results
        .filter(
            (r): r is PromiseFulfilledResult<Publication[]> =>
                r.status === "fulfilled"
        )
        .flatMap((r) => r.value)
        .sort((a, b) => b.year - a.year)
        // Renumber after merge
        .map((p, i) => ({ ...p, no: i + 1 }));

    // Fall back to hardcoded if all fetches failed
    return papers.length > 0 ? papers : PUBLICATIONS;
}

export const fetchAllPublications = unstable_cache(
    fetchAllPublicationsRaw,
    ["all-publications"],
    { revalidate: 86400 } // cache 24 jam — publications change slowly
);

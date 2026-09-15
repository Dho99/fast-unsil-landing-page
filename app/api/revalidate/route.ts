import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(req: Request) {
    const secret = process.env.REVALIDATE_SECRET;
    if (secret) {
        const auth = req.headers.get("authorization") ?? "";
        const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
        const headerSecret = req.headers.get("x-revalidate-secret") ?? "";
        if (token !== secret && headerSecret !== secret) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    (revalidateTag as unknown as (tag: string) => void)("info-dikti");
    (revalidateTag as unknown as (tag: string) => void)("all-news");
    revalidatePath("/info-dikti");
    revalidatePath("/");

    return Response.json({ revalidated: true, now: Date.now() });
}

import { fetchInfoDikti } from "@/lib/scrapers";
import type { NewsArticle } from "@/lib/constants";
import NavbarWrapper from "@/components/NavbarWrapper";
import InfoDiktiCard from "@/components/InfoDiktiCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Info Dikti — FAST UNSIL",
    description: "Agregasi pengumuman dari portal-portal Dikti: Kemdiktisaintek, Hiliriset, BIMA, dan BRIN.",
};

const BERITA_SOURCES = new Set(["Kemdiktisaintek", "Direktorat Sumber Daya"]);
const SIDEBAR_ORDER = ["BIMA", "Hiliriset", "BRIN Pendanaan Risnov"];
const SIDEBAR_LABEL: Record<string, string> = {
    BIMA: "BIMA",
    Hiliriset: "Hiliriset",
    "BRIN Pendanaan Risnov": "BRIN",
};

function groupBySource(items: NewsArticle[]): Map<string, NewsArticle[]> {
    return items.reduce((map, item) => {
        const key = item.source ?? "Dikti";
        const arr = map.get(key) ?? [];
        arr.push(item);
        map.set(key, arr);
        return map;
    }, new Map<string, NewsArticle[]>());
}

export default async function InfoDiktiPage() {
    const items = await fetchInfoDikti();
    const grouped = groupBySource(items);

    const beritaItems = items.filter((i) => BERITA_SOURCES.has(i.source ?? ""));
    const sidebarCategories = SIDEBAR_ORDER
        .map((src) => [src, grouped.get(src) ?? []] as [string, NewsArticle[]])
        .filter(([, catItems]) => catItems.length > 0);

    return (
        <main className="min-h-screen bg-background text-foreground">
            <NavbarWrapper activeSection="/info-dikti" />
            <div className="max-w-7xl mx-auto px-4 py-10">
                <header className="mb-8">
                    <h1 className="font-heading text-2xl font-bold tracking-widest uppercase text-primary mb-1">
                        Info Dikti
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Agregasi pengumuman dari portal Dikti — diperbarui setiap jam.
                    </p>
                </header>

                {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Belum ada data. Coba muat ulang halaman.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
                        <InfoDiktiCard
                            title="Berita & Pengumuman"
                            items={beritaItems}
                            variant="berita"
                        />
                        {sidebarCategories.map(([source, catItems]) => (
                            <InfoDiktiCard
                                key={source}
                                title={SIDEBAR_LABEL[source] ?? source}
                                items={catItems}
                                variant="announcement"
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

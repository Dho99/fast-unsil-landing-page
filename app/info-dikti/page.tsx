import { fetchInfoDikti } from "@/lib/scrapers";
import type { NewsArticle } from "@/lib/constants";
import NavbarWrapper from "@/components/NavbarWrapper";
import { formatIsoToDisplay } from "@/lib/scrapers/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Info Dikti — FAST UNSIL",
    description: "Agregasi pengumuman dari portal-portal Dikti: Kemdiktisaintek, Hiliriset, BIMA, dan BRIN.",
};

const BERITA_SOURCES = new Set(["Kemdiktisaintek", "Direktorat Sumber Daya"]);
const SIDEBAR_ORDER = ["BIMA", "Hiliriset", "BRIN Pendanaan Risnov"];
const SIDEBAR_LABEL: Record<string, string> = {
    "BIMA": "BIMA",
    "Hiliriset": "Hiliriset",
    "BRIN Pendanaan Risnov": "BRIN",
};

function isPdfLink(url?: string): boolean {
    if (!url) return false;
    return url.toLowerCase().includes(".pdf");
}

function SourceBadge({ source }: { source?: string }) {
    return (
        <span className="inline-block shrink-0 font-mono text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5">
            {source ?? "Dikti"}
        </span>
    );
}

function PdfBadge({ href }: { href: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block shrink-0 font-mono text-xs text-red-400 border border-red-400/40 rounded px-1.5 py-0.5 hover:bg-red-400/10 transition-colors"
        >
            PDF
        </a>
    );
}

function NewsCard({ item }: { item: NewsArticle }) {
    const pdfUrl = item.pdfLink ?? (isPdfLink(item.link) ? item.link : undefined);
    const titleLink = !isPdfLink(item.link) ? item.link : undefined;

    return (
        <div className="border border-border rounded-lg p-4 flex flex-col gap-2 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-2 flex-wrap">
                <SourceBadge source={item.source} />
                <span className="font-mono text-xs text-muted-foreground">
                    {formatIsoToDisplay(item.date)}
                </span>
            </div>
            <div className="flex-1 min-w-0">
                {titleLink ? (
                    <a
                        href={titleLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium leading-snug text-foreground hover:text-primary transition-colors"
                    >
                        {item.title}
                    </a>
                ) : (
                    <span className="text-sm font-medium leading-snug text-foreground">
                        {item.title}
                    </span>
                )}
            </div>
            {pdfUrl && (
                <div>
                    <PdfBadge href={pdfUrl} />
                </div>
            )}
        </div>
    );
}

function AnnouncementRow({ item }: { item: NewsArticle }) {
    const pdfUrl = item.pdfLink ?? (isPdfLink(item.link) ? item.link : undefined);
    const titleLink = !isPdfLink(item.link) ? item.link : undefined;

    return (
        <li className="flex items-baseline gap-2 py-2 border-b border-border/40 last:border-0">
            <span className="flex-1 min-w-0 text-sm leading-snug">
                {titleLink ? (
                    <a
                        href={titleLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground hover:text-primary transition-colors"
                    >
                        {item.title}
                    </a>
                ) : (
                    <span className="text-foreground">{item.title}</span>
                )}
            </span>
            {pdfUrl && <PdfBadge href={pdfUrl} />}
        </li>
    );
}

function CategoryBox({ title, items }: { title: string; items: NewsArticle[] }) {
    if (items.length === 0) return null;
    return (
        <div className="border border-border rounded-lg p-4">
            <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                {SIDEBAR_LABEL[title] ?? title}
            </h3>
            <ul>
                {items.map((item) => (
                    <AnnouncementRow key={item.id} item={item} />
                ))}
            </ul>
        </div>
    );
}

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
                    <div className="flex gap-6 items-start">
                        <section className="flex-1 min-w-0">
                            <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                                Berita &amp; Pengumuman
                            </h2>
                            {beritaItems.length > 0 ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {beritaItems.map((item) => (
                                        <NewsCard key={item.id} item={item} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Belum ada data berita.
                                </p>
                            )}
                        </section>

                        <aside className="w-72 shrink-0 flex flex-col gap-4">
                            {sidebarCategories.map(([source, catItems]) => (
                                <CategoryBox key={source} title={source} items={catItems} />
                            ))}
                        </aside>
                    </div>
                )}
            </div>
        </main>
    );
}

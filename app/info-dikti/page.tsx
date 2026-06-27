import { fetchInfoDikti } from "@/lib/scrapers";
import type { NewsArticle } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Info Dikti — FAST UNSIL",
    description: "Agregasi pengumuman dari portal-portal Dikti: Kemdiktisaintek, Hiliriset, BIMA, dan BRIN.",
};

const SOURCE_LABEL: Record<string, string> = {
    Kemdiktisaintek: "Kemdiktisaintek",
    "Direktorat Sumber Daya": "Kemdiktisaintek",
    Hiliriset: "Hiliriset",
    BIMA: "BIMA",
    Arjuna: "Arjuna",
    "BRIN Pendanaan Risnov": "BRIN",
};

function isPdfLink(url?: string): boolean {
    if (!url) return false;
    return url.toLowerCase().includes(".pdf");
}

function SourceBadge({ source }: { source?: string }) {
    const label = (source && SOURCE_LABEL[source]) ?? source ?? "Dikti";
    return (
        <span className="inline-block shrink-0 font-mono text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5">
            {label}
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

function AnnouncementRow({ item }: { item: NewsArticle }) {
    const pdfUrl = item.pdfLink ?? (isPdfLink(item.link) ? item.link : undefined);
    const titleLink = !isPdfLink(item.link) ? item.link : undefined;

    return (
        <li className="flex items-baseline gap-2 py-2 border-b border-border/40 last:border-0">
            <SourceBadge source={item.source} />
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

export default async function InfoDiktiPage() {
    const items = await fetchInfoDikti();

    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="max-w-4xl mx-auto px-4 py-10">
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
                    <ul className="divide-y divide-border/0">
                        {items.map((item) => (
                            <AnnouncementRow key={item.id} item={item} />
                        ))}
                    </ul>
                )}
            </div>
        </main>
    );
}

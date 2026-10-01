"use client";

import { useState } from "react";
import type { NewsArticle } from "@/lib/constants";
import { formatIsoToDisplay, formatPublishedAt } from "@/lib/scrapers/utils";

const PAGE_SIZE_OPTIONS = [5, 10, 20] as const;
const DEFAULT_PAGE_SIZE = 5;

function isPdfLink(url?: string): boolean {
    if (!url) return false;
    return url.toLowerCase().includes(".pdf");
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

function ItemRow({
    item,
    variant,
}: {
    item: NewsArticle;
    variant: "berita" | "announcement";
}) {
    const pdfUrl = item.pdfLink ?? (isPdfLink(item.link) ? item.link : undefined);
    const titleHref =
        item.link && item.link !== "#" ? item.link : pdfUrl;

    const meta =
        variant === "berita"
            ? [
                  item.source ?? "Dikti",
                  formatIsoToDisplay(item.date),
                  formatPublishedAt(item.date),
              ].join(" · ")
            : formatPublishedAt(item.date);

    // Normalize attachments: prioritize explicit attachments array, or fall back to single pdfLink
    const explicitAttachments = item.attachments ?? [];
    const fallbackAttachments = pdfUrl
        ? [
              {
                  name: item.title.toLowerCase().endsWith(".pdf")
                      ? item.title
                      : `${item.title}.pdf`,
                  url: pdfUrl,
              },
          ]
        : [];
    const attachments =
        explicitAttachments.length > 0 ? explicitAttachments : fallbackAttachments;

    return (
        <li className="py-2.5 border-b border-border/40 last:border-0">
            <div className="text-sm leading-snug">
                {titleHref ? (
                    <a
                        href={titleHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground hover:text-primary transition-colors font-medium"
                    >
                        {item.title}
                    </a>
                ) : (
                    <span className="text-foreground font-medium">{item.title}</span>
                )}
            </div>

            {item.excerpt && (
                <div className="text-xs text-muted-foreground/80 mt-1">
                    {item.excerpt}
                </div>
            )}

            {attachments.length > 0 && (
                <div className="mt-2 text-xs bg-muted/40 border border-border/50 rounded-md p-2 space-y-1.5">
                    <div className="font-mono text-[11px] font-semibold text-muted-foreground">
                        Unduh Dokumen{attachments.length > 1 ? ` (${attachments.length})` : ""}:
                    </div>
                    <ul className="space-y-1">
                        {attachments.map((att, idx) => (
                            <li
                                key={idx}
                                className="flex items-center justify-between gap-2 text-xs"
                            >
                                <a
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline truncate flex-1 font-mono text-[11px]"
                                    title={att.name}
                                >
                                    📄 {att.name}
                                </a>
                                <PdfBadge href={att.url} />
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {meta && (
                <div className="font-mono text-[10px] text-muted-foreground/40 mt-1.5">
                    {meta}
                </div>
            )}
        </li>
    );
}

export default function InfoDiktiCard({
    title,
    items,
    variant,
}: {
    title: string;
    items: NewsArticle[];
    variant: "berita" | "announcement";
}) {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

    if (items.length === 0) return null;

    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const pageItems = items.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
    );
    const showFooter = items.length > DEFAULT_PAGE_SIZE;

    function handlePageSizeChange(nextSize: number) {
        setPageSize(nextSize);
        setPage(1);
    }

    return (
        <div className="h-full border border-border rounded-lg p-4 flex flex-col">
            <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                {title}
            </h2>
            <ul className="flex-1">
                {pageItems.map((item) => (
                    <ItemRow key={item.id} item={item} variant={variant} />
                ))}
            </ul>

            {showFooter && (
                <div className="mt-3 pt-3 border-t border-border/40 flex flex-wrap items-center justify-between gap-2">
                    <label className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                        <span>Per page</span>
                        <select
                            value={pageSize}
                            onChange={(e) =>
                                handlePageSizeChange(Number(e.target.value))
                            }
                            className="bg-background border border-border rounded px-1.5 py-0.5 text-foreground"
                        >
                            {PAGE_SIZE_OPTIONS.map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </label>

                    {totalPages > 1 && (
                        <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                            <button
                                type="button"
                                disabled={currentPage <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="px-1.5 py-0.5 border border-border rounded disabled:opacity-30 hover:text-primary transition-colors"
                            >
                                Prev
                            </button>
                            <span>
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                type="button"
                                disabled={currentPage >= totalPages}
                                onClick={() =>
                                    setPage((p) => Math.min(totalPages, p + 1))
                                }
                                className="px-1.5 py-0.5 border border-border rounded disabled:opacity-30 hover:text-primary transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

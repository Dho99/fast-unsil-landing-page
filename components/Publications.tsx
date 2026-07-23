"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PUBLICATIONS } from "@/lib/constants";
import type { Publication } from "@/lib/constants";

function PubItem({ pub, index }: { pub: Publication; index: number }) {
    const inner = (
        <motion.li
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: index * 0.08 }}
            className="flex gap-5 items-start pb-6 border-b border-[rgba(59,130,246,0.1)] last:border-b-0 last:pb-0"
        >
            <div
                className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-mono text-[13px] font-bold mt-0.5"
                style={{
                    background: `${pub.accentColor}18`,
                    color: pub.accentColor,
                    border: `1px solid ${pub.accentColor}35`,
                }}
            >
                {String(pub.no).padStart(2, "0")}
            </div>

            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <h3 className="font-heading font-bold text-content text-[1rem] leading-[1.5]">
                    {pub.title}
                </h3>
                <p className="font-mono text-[12px] text-muted-text tracking-[0.05em]">
                    {pub.authors}
                </p>
                <p
                    className="font-mono text-[11px] tracking-[0.12em] uppercase"
                    style={{ color: pub.accentColor }}
                >
                    {pub.venue} · {pub.year}
                </p>
            </div>
        </motion.li>
    );

    return pub.link ? (
        <a
            href={pub.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:opacity-80 transition-opacity"
        >
            {inner}
        </a>
    ) : (
        inner
    );
}

export default function Publications() {
    const [pubs, setPubs] = useState<Publication[]>(PUBLICATIONS);

    useEffect(() => {
        fetch("/api/publications")
            .then((r) => r.json())
            .then((data: Publication[]) => {
                if (Array.isArray(data) && data.length > 0) setPubs(data);
            })
            .catch(() => {});
    }, []);

    return (
        <section id="riset" className="py-20 px-[clamp(16px,4vw,56px)]">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-[clamp(36px,6vw,66px)] flex flex-col items-center">
                    <div className="text-[13px] text-[#3B82F6] tracking-[0.32em] font-mono mb-[13px] font-semibold">
                        ▸ KARYA ILMIAH
                    </div>
                    <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-0.02em] mb-[14px] text-content font-heading">
                        Publikasi Unggulan
                    </h2>
                    <p className="text-muted-text max-w-[440px] mx-auto leading-[1.75] text-[1.1rem]">
                        Penelitian terpilih dari anggota FAST yang
                        dipublikasikan di konferensi dan jurnal bereputasi.
                    </p>
                </div>

                <ol className="flex flex-col gap-6">
                    {pubs.map((pub, i) => (
                        <PubItem key={pub.no} pub={pub} index={i} />
                    ))}
                </ol>

                <div className="flex justify-end gap-4 mt-8">
                    <a
                        href="/rss/publications"
                        className="text-[#3B82F6] font-mono text-[13px] tracking-[0.1em] hover:opacity-70 transition-opacity"
                    >
                        RSS Publikasi →
                    </a>
                </div>
            </div>
        </section>
    );
}

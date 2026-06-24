"use client";

import { motion } from "framer-motion";
import { NEWS } from "@/lib/constants";
import type { NewsArticle } from "@/lib/constants";

function NewsCard({ article }: { article: NewsArticle }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col rounded-2xl border border-[rgba(59,130,246,0.12)] overflow-hidden hover:-translate-y-1 transition-transform duration-300"
            style={{ background: "var(--card-custom-bg)" }}
        >
            <div
                className="h-[180px] w-full shrink-0 "
                style={{ background: article.imagePlaceholder }}
            />

            <div className="flex flex-col gap-3 p-6 flex-1">
                <span
                    className="self-start text-[11px] font-mono tracking-[0.22em] px-3 py-1 rounded-full border font-semibold"
                    style={{
                        color: article.categoryColor,
                        backgroundColor: `${article.categoryColor}18`,
                        borderColor: `${article.categoryColor}35`,
                    }}
                >
                    {article.category}
                </span>

                <h3 className="font-heading font-bold text-content text-[1.05rem] leading-[1.45] line-clamp-2">
                    {article.title}
                </h3>

                <p className="text-muted-text text-[0.9rem] leading-[1.7] line-clamp-3 flex-1">
                    {article.excerpt}
                </p>

                <div className="flex items-center justify-between mt-2">
                    <span className="font-mono text-[11px] text-subtle-text tracking-[0.12em]">
                        {article.date}
                    </span>
                    <a
                        href="#"
                        className="text-[#3B82F6] font-mono text-[12px] tracking-[0.08em] hover:opacity-70 transition-opacity"
                    >
                        Baca Selengkapnya →
                    </a>
                </div>
            </div>
        </motion.div>
    );
}

export default function NewsArticles() {
    return (
        <section id="berita" className="py-20 px-[clamp(16px,4vw,56px)]">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-[clamp(36px,6vw,66px)] flex flex-col items-center">
                    <div className="text-[13px] text-[#3B82F6] tracking-[0.32em] font-mono mb-[13px] font-semibold">
                        ▸ INFORMASI TERKINI
                    </div>
                    <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-0.02em] mb-[14px] text-content font-heading">
                        Berita &amp; Artikel
                    </h2>
                    <p className="text-muted-text max-w-[440px] mx-auto leading-[1.75] text-[1.1rem]">
                        Ikuti perkembangan terbaru riset, kompetisi, dan
                        kegiatan komunitas FAST.
                    </p>
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
                    {NEWS.map((article) => (
                        <NewsCard key={article.id} article={article} />
                    ))}
                </div>

                <div className="flex justify-end mt-8">
                    <a
                        href="#"
                        className="text-[#3B82F6] font-mono text-[13px] tracking-[0.1em] hover:opacity-70 transition-opacity"
                    >
                        Lihat Semua →
                    </a>
                </div>
            </div>
        </section>
    );
}

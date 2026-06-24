"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PARTNER_CATEGORIES } from "@/lib/constants";
import type { Partner } from "@/lib/constants";

function PartnerLogo({ partner }: { partner: Partner }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="w-28 h-16 rounded-xl flex items-center justify-center font-mono text-[11px] tracking-[0.15em] transition-all duration-200 cursor-default select-none"
            style={{
                background: "var(--card-custom-bg)",
                border: `1px solid ${hovered ? "rgba(59,130,246,0.45)" : "rgba(59,130,246,0.12)"}`,
                color: hovered ? "#3B82F6" : "var(--text-subtle)",
            }}
        >
            {partner.logoPlaceholder}
        </div>
    );
}

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Collaborators() {
    return (
        <section id="kolaborator" className="py-20 px-[clamp(16px,4vw,56px)]">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-[clamp(36px,6vw,66px)] flex flex-col items-center">
                    <div className="text-[13px] text-[#3B82F6] tracking-[0.32em] font-mono mb-[13px] font-semibold">
                        ▸ ALUMNI &amp; MITRA
                    </div>
                    <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-0.02em] mb-[14px] text-content font-heading">
                        Kolokium &amp;{" "}
                        <span className="text-[#3B82F6]">Kolaborator</span>
                    </h2>
                    <p className="text-muted-text max-w-[440px] mx-auto leading-[1.75] text-[1.1rem]">
                        Jaringan mitra yang mendukung ekosistem riset dan
                        pengembangan FAST.
                    </p>
                </div>

                <motion.div
                    className="flex flex-col gap-10"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                >
                    {PARTNER_CATEGORIES.map((cat) => (
                        <motion.div
                            key={cat.label}
                            variants={itemVariants}
                            className="flex flex-col gap-4"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-1 h-5 rounded-full shrink-0"
                                    style={{ background: cat.accent }}
                                />
                                <span
                                    className="font-mono text-[13px] tracking-[0.2em] font-semibold"
                                    style={{ color: cat.accent }}
                                >
                                    {cat.label}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {cat.partners.map((p) => (
                                    <PartnerLogo key={p.name} partner={p} />
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TEAM } from "@/lib/constants";
import type { TeamMember } from "@/lib/constants";

function MemberCard({ member }: { member: TeamMember }) {
    const [hovered, setHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45 }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="flex flex-col items-center gap-4 p-6 rounded-2xl border transition-all duration-300"
            style={{
                background: "var(--card-custom-bg)",
                borderColor: hovered
                    ? `${member.accentColor}45`
                    : "rgba(59,130,246,0.12)",
                transform: hovered ? "translateY(-6px)" : "translateY(0)",
            }}
        >
            <div
                className="w-24 h-24 rounded-full flex items-center justify-center font-heading text-xl font-bold"
                style={{
                    background: `${member.accentColor}18`,
                    border: `2px solid ${member.accentColor}`,
                    color: member.accentColor,
                }}
            >
                {member.initials}
            </div>

            <div className="text-center">
                <h3 className="font-heading font-bold text-content text-[0.95rem] leading-[1.4] mb-1">
                    {member.name}
                </h3>
                <p className="font-mono text-[11px] text-muted-text tracking-[0.1em]">
                    {member.role}
                </p>
            </div>
        </motion.div>
    );
}

export default function TeamMembers() {
    return (
        <section id="anggota" className="py-20 px-[clamp(16px,4vw,56px)]">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-[clamp(36px,6vw,66px)] flex flex-col items-center">
                    <div className="text-[13px] text-[#3B82F6] tracking-[0.32em] font-mono mb-[13px] font-semibold">
                        ▸ ANGGOTA &amp; PARTNER
                    </div>
                    <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-0.02em] mb-[14px] text-content font-heading">
                        Tim Inti
                    </h2>
                    <p className="text-muted-text max-w-[440px] mx-auto leading-[1.75] text-[1.1rem] mb-6">
                        Mereka yang membentuk dan menjalankan visi FAST sebagai
                        komunitas riset unggulan.
                    </p>
                    <a
                        href="#"
                        className="font-mono text-[13px] tracking-[0.1em] text-[#3B82F6] hover:opacity-70 transition-opacity"
                    >
                        Lihat Semua Anggota →
                    </a>
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-6">
                    {TEAM.map((member) => (
                        <MemberCard key={member.id} member={member} />
                    ))}
                </div>
            </div>
        </section>
    );
}

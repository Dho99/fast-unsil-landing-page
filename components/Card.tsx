"use client";

import { useState } from "react";
import type { CardData } from "@/lib/constants";

export default function Card({ d }: { d: CardData }) {
    const [h, setH] = useState(false);
    return (
        <div
            onMouseEnter={() => setH(true)}
            onMouseLeave={() => setH(false)}
            className="group transition-transform duration-300 ease-out hover:-translate-y-1.5"
            style={{
                background: h
                    ? `rgba(${d.rgb},0.07)`
                    : "var(--card-custom-bg)",
                border: `1px solid rgba(${d.rgb},${h ? 0.5 : 0.2})`,
                borderRadius: 16,
                padding: "32px 24px",
                position: "relative",
                overflow: "hidden",
                transitionProperty: "transform, background, border",
                transitionDuration: "0.3s",
                transitionTimingFunction: "ease-out",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 56,
                    height: 56,
                    borderLeft: `1px solid rgba(${d.rgb},${h ? 0.4 : 0.1})`,
                    borderBottom: `1px solid rgba(${d.rgb},${h ? 0.4 : 0.1})`,
                    borderBottomLeftRadius: 16,
                    transition: "all 0.3s",
                }}
            />
            <div
                className="font-mono text-[11px] tracking-[0.22em] mb-4"
                style={{ color: `rgba(${d.rgb},0.55)` }}
            >
                [{d.n}]
            </div>
            <div
                className="w-8 h-[3px] mb-[18px] rounded-sm transition-all duration-300 ease-out group-hover:w-[52px]"
                style={{ background: d.c }}
            />
            <h3 className="text-[1.3rem] font-bold text-content mb-[10px]">
                {d.title}
            </h3>
            <p className="text-muted-text leading-[1.72] text-[1rem]">
                {d.desc}
            </p>
        </div>
    );
}

"use client";

import { useState } from "react";
import type { CardData } from "@/lib/constants";

export default function Card({ d }: { d: CardData }) {
    const [h, setH] = useState(false);
    return (
        <div
            onMouseEnter={() => setH(true)}
            onMouseLeave={() => setH(false)}
            style={{
                background: h
                    ? `rgba(${d.rgb},0.07)`
                    : "rgba(255,255,255,0.02)",
                border: `1px solid rgba(${d.rgb},${h ? 0.5 : 0.2})`,
                borderRadius: 16,
                padding: "32px 24px",
                transition: "all 0.3s ease",
                transform: h ? "translateY(-6px)" : "translateY(0)",
                position: "relative",
                overflow: "hidden",
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
                style={{
                    fontFamily: "monospace",
                    fontSize: 10,
                    color: `rgba(${d.rgb},0.55)`,
                    letterSpacing: "0.22em",
                    marginBottom: 16,
                }}
            >
                [{d.n}]
            </div>
            <div
                style={{
                    width: h ? 52 : 32,
                    height: 3,
                    background: d.c,
                    borderRadius: 2,
                    marginBottom: 18,
                    transition: "width 0.3s ease",
                }}
            />
            <h3
                style={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: 10,
                }}
            >
                {d.title}
            </h3>
            <p
                style={{
                    color: "#6B7A95",
                    lineHeight: 1.72,
                    fontSize: "0.87rem",
                }}
            >
                {d.desc}
            </p>
        </div>
    );
}

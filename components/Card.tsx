"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { CardData } from "@/lib/constants";

export default function Card({ d }: { d: CardData }) {
    const [h, setH] = useState(false);
    return (
        <motion.div
            onMouseEnter={() => setH(true)}
            onMouseLeave={() => setH(false)}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
                background: h
                    ? `rgba(${d.rgb},0.07)`
                    : "rgba(255,255,255,0.02)",
                border: `1px solid rgba(${d.rgb},${h ? 0.5 : 0.2})`,
                borderRadius: 16,
                padding: "32px 24px",
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
            <motion.div
                animate={{ width: h ? 52 : 32 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{
                    height: 3,
                    background: d.c,
                    borderRadius: 2,
                    marginBottom: 18,
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
        </motion.div>
    );
}

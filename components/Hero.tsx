"use client";

import { motion } from "framer-motion";
import { WORDS } from "@/lib/constants";
import CyberBg from "./CyberBg";
import CycleWord from "./CycleWord";

const btnHover = {
    whileHover: { y: -2 },
    transition: { duration: 0.25 } as const,
};

export default function Hero() {
    return (
        <section
            style={{
                position: "relative",
                height: "calc(100vh - 64px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
            }}
        >
            <CyberBg />

            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "radial-gradient(ellipse at center, transparent 35%, rgba(7,11,24,0.65) 100%)",
                    zIndex: 1,
                    pointerEvents: "none",
                }}
            />

            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 4px)",
                    zIndex: 1,
                    pointerEvents: "none",
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 36 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                style={{
                    position: "relative",
                    zIndex: 2,
                    textAlign: "center",
                    padding: "0 clamp(20px,5vw,48px)",
                    maxWidth: 800,
                }}
            >
                <div
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        background: "rgba(0,212,170,0.07)",
                        border: "1px solid rgba(0,212,170,0.22)",
                        borderRadius: 24,
                        padding: "5px 14px",
                        marginBottom: 26,
                    }}
                >
                    <motion.div
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: "#00D4AA",
                        }}
                    />
                    <span
                        style={{
                            fontSize: 10,
                            letterSpacing: "0.22em",
                            color: "#00D4AA",
                            fontFamily: "monospace",
                        }}
                    >
                        UNIVERSITAS SILIWANGI · ACTIVE
                    </span>
                </div>

                <h1
                    style={{
                        fontSize: "clamp(1.8rem,5.5vw,4.8rem)",
                        fontWeight: 800,
                        lineHeight: 1.13,
                        letterSpacing: "-0.025em",
                        marginBottom: 8,
                    }}
                >
                    Kami Siap <CycleWord words={WORDS} />
                </h1>
                <h1
                    style={{
                        fontSize: "clamp(1.8rem,5.5vw,4.8rem)",
                        fontWeight: 800,
                        lineHeight: 1.13,
                        letterSpacing: "-0.025em",
                        marginBottom: 22,
                        color: "#C0CBD9",
                    }}
                >
                    Ancaman Siber
                </h1>

                <p
                    style={{
                        color: "#6B7A95",
                        fontSize: "clamp(0.85rem,1.6vw,1rem)",
                        maxWidth: 490,
                        margin: "0 auto 34px",
                        lineHeight: 1.8,
                    }}
                >
                    Komunitas riset keamanan digital yang bergerak di bidang
                    forensik, penetration testing, dan penelitian siber di
                    Universitas Siliwangi.
                </p>

                <div
                    style={{
                        display: "flex",
                        gap: 12,
                        justifyContent: "center",
                        flexWrap: "wrap",
                    }}
                >
                    <motion.button
                        {...btnHover}
                        whileHover={{
                            ...btnHover.whileHover,
                            boxShadow: "0 8px 28px rgba(0,212,170,0.3)",
                        }}
                        style={{
                            background: "#00D4AA",
                            color: "#070B18",
                            border: "none",
                            padding: "12px 26px",
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: "pointer",
                            letterSpacing: "0.07em",
                            minHeight: 44,
                        }}
                    >
                        Eksplor FAST →
                    </motion.button>
                    <motion.button
                        {...btnHover}
                        whileHover={{
                            ...btnHover.whileHover,
                            borderColor: "rgba(192,203,217,0.5)",
                            color: "#fff",
                        }}
                        style={{
                            background: "transparent",
                            color: "#C0CBD9",
                            border: "1px solid rgba(192,203,217,0.2)",
                            padding: "12px 26px",
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: "pointer",
                            minHeight: 44,
                        }}
                    >
                        Lihat Riset
                    </motion.button>
                </div>
            </motion.div>

            <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: "absolute",
                    bottom: 26,
                    left: "50%",
                    textAlign: "center",
                    zIndex: 2,
                }}
            >
                <div
                    style={{
                        fontSize: 9,
                        letterSpacing: "0.28em",
                        color: "#3A4455",
                        fontFamily: "monospace",
                        marginBottom: 6,
                    }}
                >
                    SCROLL
                </div>
                <div style={{ color: "#00D4AA", fontSize: 15 }}>↓</div>
            </motion.div>
        </section>
    );
}

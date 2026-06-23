"use client";

import { WORDS } from "@/lib/constants";
import CyberBg from "./CyberBg";
import CycleWord from "./CycleWord";

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

            <div
                style={{
                    position: "relative",
                    zIndex: 2,
                    textAlign: "center",
                    padding: "0 clamp(20px,5vw,48px)",
                    animation: "fu 0.9s ease both",
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
                    <div
                        style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: "#00D4AA",
                            animation: "pl 2s ease-in-out infinite",
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
                        fontSize: "clamp(2rem,5.5vw,4.8rem)",
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
                        fontSize: "clamp(2rem,5.5vw,4.8rem)",
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
                        fontSize: "clamp(0.88rem,1.6vw,1rem)",
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
                    <button
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
                            transition: "box-shadow 0.25s, transform 0.25s",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow =
                                "0 8px 28px rgba(0,212,170,0.3)";
                            e.currentTarget.style.transform =
                                "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = "";
                            e.currentTarget.style.transform = "";
                        }}
                    >
                        Eksplor FAST →
                    </button>
                    <button
                        style={{
                            background: "transparent",
                            color: "#C0CBD9",
                            border: "1px solid rgba(192,203,217,0.2)",
                            padding: "12px 26px",
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: "pointer",
                            transition: "border-color 0.2s, color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor =
                                "rgba(192,203,217,0.5)";
                            e.currentTarget.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor =
                                "rgba(192,203,217,0.2)";
                            e.currentTarget.style.color = "#C0CBD9";
                        }}
                    >
                        Lihat Riset
                    </button>
                </div>
            </div>

            <div
                style={{
                    position: "absolute",
                    bottom: 26,
                    left: "50%",
                    textAlign: "center",
                    zIndex: 2,
                    animation: "bb 2s ease-in-out infinite",
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
            </div>
        </section>
    );
}

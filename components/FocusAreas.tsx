"use client";

import { CARDS } from "@/lib/constants";
import Card from "./Card";

export default function FocusAreas() {
    return (
        <section
            style={{
                padding: "clamp(56px,9vw,110px) clamp(20px,5vw,60px)",
            }}
        >
            <div style={{ maxWidth: 1060, margin: "0 auto" }}>
                <div
                    style={{
                        textAlign: "center",
                        marginBottom: "clamp(36px,6vw,66px)",
                    }}
                >
                    <div
                        style={{
                            fontSize: 10,
                            color: "#00D4AA",
                            letterSpacing: "0.32em",
                            fontFamily: "monospace",
                            marginBottom: 13,
                        }}
                    >
                        ▸ FOKUS RISET
                    </div>
                    <h2
                        style={{
                            fontSize: "clamp(1.6rem,3.6vw,2.6rem)",
                            fontWeight: 800,
                            letterSpacing: "-0.02em",
                            marginBottom: 14,
                        }}
                    >
                        Apa yang FAST Kerjakan?
                    </h2>
                    <p
                        style={{
                            color: "#6B7A95",
                            maxWidth: 440,
                            margin: "0 auto",
                            lineHeight: 1.75,
                            fontSize: "0.9rem",
                        }}
                    >
                        Dari investigasi artefak digital hingga pengujian
                        keamanan aktif — kami bergerak di garis terdepan
                        siber.
                    </p>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: 16,
                    }}
                >
                    {CARDS.map((d) => (
                        <Card key={d.n} d={d} />
                    ))}
                </div>
            </div>
        </section>
    );
}

"use client";

import { NAV } from "@/lib/constants";

export default function Navbar({ scrolled }: { scrolled: boolean }) {
    return (
        <nav
            style={{
                position: "sticky",
                top: 0,
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 clamp(16px,4vw,56px)",
                height: 64,
                background: scrolled ? "rgba(7,11,24,0.92)" : "transparent",
                backdropFilter: scrolled ? "blur(14px)" : "none",
                borderBottom: scrolled
                    ? "1px solid rgba(0,212,170,0.11)"
                    : "none",
                transition: "all 0.35s ease",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "rgba(0,212,170,0.1)",
                        border: "1.5px solid #00D4AA",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: 13,
                        color: "#00D4AA",
                    }}
                >
                    F
                </div>
                <span
                    style={{
                        fontWeight: 700,
                        fontSize: 13,
                        letterSpacing: "0.18em",
                    }}
                >
                    FAST
                </span>
            </div>

            <div style={{ display: "flex", gap: "clamp(14px,2.5vw,30px)" }}>
                {NAV.map((l) => (
                    <a
                        key={l}
                        href="#"
                        style={{
                            color: "#8892A4",
                            fontSize: 13,
                            letterSpacing: "0.07em",
                            transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "#00D4AA")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#8892A4")
                        }
                    >
                        {l}
                    </a>
                ))}
            </div>

            <button
                style={{
                    background: "#E85A4F",
                    color: "#fff",
                    border: "none",
                    padding: "8px 20px",
                    borderRadius: 24,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    letterSpacing: "0.07em",
                    transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) =>
                    (e.currentTarget.style.opacity = "0.82")
                }
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
                Bergabung
            </button>
        </nav>
    );
}

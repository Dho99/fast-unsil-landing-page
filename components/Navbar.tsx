"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export default function Navbar({ scrolled }: { scrolled: boolean }) {
    const [menuOpen, setMenuOpen] = useState(false);

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

            {/* Desktop links */}
            <div
                className="hidden md:flex"
                style={{ gap: "clamp(14px,2.5vw,30px)" }}
            >
                {NAV.map((l) => (
                    <motion.a
                        key={l}
                        href="#"
                        whileHover={{ color: "#00D4AA" }}
                        style={{
                            color: "#8892A4",
                            fontSize: 13,
                            letterSpacing: "0.07em",
                        }}
                    >
                        {l}
                    </motion.a>
                ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:block">
                <Button
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
                    }}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.opacity = "0.82")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                    Bergabung
                </Button>
            </div>

            {/* Mobile hamburger */}
            <button
                className="md:hidden flex items-center justify-center"
                style={{
                    background: "none",
                    border: "none",
                    color: "#00D4AA",
                    cursor: "pointer",
                    padding: 4,
                }}
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
            >
                <Menu size={24} />
            </button>

            {/* Mobile overlay menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 200,
                            background: "rgba(7,11,24,0.97)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 32,
                        }}
                    >
                        <button
                            style={{
                                position: "absolute",
                                top: 20,
                                right: 20,
                                background: "none",
                                border: "none",
                                color: "#00D4AA",
                                cursor: "pointer",
                                padding: 4,
                            }}
                            onClick={() => setMenuOpen(false)}
                            aria-label="Close menu"
                        >
                            <X size={24} />
                        </button>
                        {NAV.map((l, idx) => (
                            <motion.a
                                key={l}
                                href="#"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08 }}
                                whileHover={{ color: "#00D4AA" }}
                                style={{
                                    color: "#8892A4",
                                    fontSize: 18,
                                    letterSpacing: "0.12em",
                                }}
                                onClick={() => setMenuOpen(false)}
                            >
                                {l}
                            </motion.a>
                        ))}
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.32 }}
                            style={{
                                background: "#E85A4F",
                                color: "#fff",
                                border: "none",
                                padding: "12px 32px",
                                borderRadius: 24,
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: "pointer",
                                letterSpacing: "0.07em",
                                marginTop: 8,
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.opacity = "0.82")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.opacity = "1")
                            }
                            onClick={() => setMenuOpen(false)}
                        >
                            Bergabung
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

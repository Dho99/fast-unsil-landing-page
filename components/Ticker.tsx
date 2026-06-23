"use client";

import { TICKER } from "@/lib/constants";

export default function Ticker() {
    const tickerText = TICKER.map((t) => `◈ ${t}`).join("   ");

    return (
        <div
            style={{
                overflow: "hidden",
                borderTop: "1px solid rgba(0,212,170,0.13)",
                borderBottom: "1px solid rgba(0,212,170,0.13)",
                background: "rgba(0,212,170,0.04)",
                padding: "10px 0",
            }}
        >
            <div
                style={{
                    display: "inline-block",
                    whiteSpace: "nowrap",
                    animation: "tk 38s linear infinite",
                    color: "#00D4AA",
                    fontFamily: "monospace",
                    fontSize: 11,
                    letterSpacing: "0.13em",
                    opacity: 0.72,
                }}
            >
                {tickerText}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{tickerText}
            </div>
        </div>
    );
}

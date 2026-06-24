"use client";

import { TICKER } from "@/lib/constants";

export default function Ticker() {
    const tickerText = TICKER.map((t) => `◈ ${t}`).join("   ");

    return (
        <div className="overflow-hidden border-t border-b border-ticker-border bg-ticker-bg py-3 sm:py-[10px]">
            <div className="inline-block whitespace-nowrap text-[#3B82F6] font-mono text-md font-semibold tracking-[0.13em] opacity-[0.72] animate-[tk_38s_linear_infinite]">
                {tickerText}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{tickerText}
            </div>
        </div>
    );
}

"use client";

import { useTheme } from "next-themes";
import { WORDS } from "@/lib/constants";
import CyberBg from "./CyberBg";
import CycleWord from "./CycleWord";

export default function Hero() {
    const { theme } = useTheme();
    const videoSrc = theme === "dark" ? "/darkmode.mp4" : "/lightmode.mp4";

    return (
        <section
            id="beranda"
            className="relative flex items-center justify-center overflow-hidden min-h-[calc(100vh-64px)] pt-10 pb-28"
        >
            <CyberBg />

            <video
                key={videoSrc}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
            >
                <source src={videoSrc} type="video/mp4" />
            </video>

            <div className="absolute inset-0 z-[1] pointer-events-none bg-black/20" />
            <div className="absolute inset-0 z-10 pointer-events-none bg-vignette" />
            <div className="absolute inset-0 z-10 pointer-events-none bg-scanline" />

            <div className="animate-in fade-in-0 slide-in-from-bottom-9 duration-700 relative z-20 text-center max-w-[800px] px-[clamp(20px,5vw,48px)]">
                <div className="inline-flex items-center gap-2 bg-pill-bg border border-pill-border rounded-[24px] px-[14px] py-[5px] mb-[26px]">
                    <div className="animate-[pulse-dot_2s_ease-in-out_infinite] w-[7px] h-[7px] rounded-full bg-[#3B82F6]" />
                    <span className="text-[12px] tracking-[0.22em] text-[#3B82F6] font-mono">
                        UNIVERSITAS SILIWANGI · ACTIVE
                    </span>
                </div>

                <h1 className="font-extrabold leading-[1.13] tracking-[-0.025em] mb-2 font-heading text-[clamp(2.8rem,6vw,5.5rem)] [text-shadow:0_1px_6px_rgba(0,0,0,0.1)] dark:[text-shadow:0_2px_12px_rgba(0,0,0,0.55)]">
                    Kami Siap <CycleWord words={WORDS} />
                </h1>
                <h1 className="font-extrabold leading-[1.13] tracking-[-0.025em] mb-[30px] text-content dark:text-hero-sub font-heading text-[clamp(2.8rem,6vw,5.5rem)] [text-shadow:0_1px_6px_rgba(0,0,0,0.1)] dark:[text-shadow:0_2px_12px_rgba(0,0,0,0.55)]">
                    Ancaman Siber
                </h1>

                <p className="mx-auto mt-6 mb-8  leading-[2] text-[clamp(1rem,1.8vw,1.15rem)] [text-shadow:0_1px_4px_rgba(0,0,0,0.08)] dark:[text-shadow:0_1px_8px_rgba(0,0,0,0.4)] dark:text-hero-sub font-semibold">
                    Komunitas riset keamanan digital yang bergerak di bidang
                    forensik, penetration testing, dan penelitian siber di
                    Universitas Siliwangi.
                </p>

                <div className="flex gap-3 mt-[30px] justify-center flex-wrap">
                    <button className="bg-[#3B82F6] text-white border-0 h-12 px-9 rounded-md text-sm font-bold cursor-pointer tracking-[0.07em] w-full sm:w-48 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(59,130,246,0.35)]">
                        Eksplor FAST →
                    </button>
                    <button className="bg-transparent text-[#374151] dark:text-hero-sub h-12 px-9 rounded-md text-sm font-medium cursor-pointer border border-[#374151]/25 dark:border-[color-mix(in_srgb,var(--hero-sub)_20%,transparent)] sm:max-w-42 w-full transition-all duration-200 hover:-translate-y-0.5 border-[rgba(192,203,217,0.5)] text-white backdrop-blur ">
                        Lihat Riset
                    </button>
                </div>
            </div>

            <div className="animate-[scroll-bounce_2s_ease-in-out_infinite] absolute bottom-[26px] left-1/2 -translate-x-1/2 text-center z-20">
                <div className="text-[11px] tracking-[0.28em] text-scroll-text font-mono mb-1.5">
                    SCROLL
                </div>
                <div className="text-[#3B82F6] text-[15px]">↓</div>
            </div>
        </section>
    );
}

"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { WORDS } from "@/lib/constants";
import CyberBg from "./CyberBg";
import CycleWord from "./CycleWord";

const btnHover = {
    whileHover: { y: -2 },
    transition: { duration: 0.25 } as const,
};

export default function Hero() {
    const { theme } = useTheme();
    const videoSrc = theme === "dark" ? "/darkmode.mp4" : "/lightmode.mp4";

    return (
        <section className="relative flex items-center justify-center overflow-hidden h-[calc(100vh-64px)]">
            <CyberBg />

            {/* Video background */}
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

            <motion.div
                initial={{ opacity: 0, y: 36 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="relative z-20 text-center max-w-[800px] px-[clamp(20px,5vw,48px)]"
            >
                <div className="inline-flex items-center gap-2 bg-pill-bg border border-pill-border rounded-[24px] px-[14px] py-[5px] mb-[26px] h-full">
                    <motion.div
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="w-[7px] h-[7px] rounded-full bg-[#3B82F6]"
                    />
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

                <p className="mx-auto mt-6 mb-8 leading-[2] text-[clamp(1rem,1.8vw,1.15rem)] [text-shadow:0_1px_4px_rgba(0,0,0,0.08)] dark:[text-shadow:0_1px_8px_rgba(0,0,0,0.4)] dark:text-hero-sub font-semibold">
                    Komunitas riset keamanan digital yang bergerak di bidang
                    forensik, penetration testing, dan penelitian siber di
                    Universitas Siliwangi.
                </p>

                <div
                    className="flex gap-3 mt-24 justify-center flex-wrap"
                    style={{ marginTop: "30px" }}
                >
                    <motion.button
                        {...btnHover}
                        whileHover={{
                            ...btnHover.whileHover,
                            boxShadow: "0 8px 28px rgba(59,130,246,0.35)",
                        }}
                        className="bg-[#3B82F6] text-white border-0 h-12 px-9 rounded-md text-sm font-bold cursor-pointer tracking-[0.07em] w-48"
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
                        className="bg-transparent text-[#374151] dark:text-hero-sub h-12 px-9 rounded-md text-sm font-medium cursor-pointer border border-[#374151]/25 dark:border-[color-mix(in_srgb,var(--hero-sub)_20%,transparent)] w-32 border border-[#374151]/25 dark:border-[color-mix(in_srgb,var(--hero-sub)_20%,transparent)] w-32 hover:border-white"
                    >
                        Lihat Riset
                    </motion.button>
                </div>
            </motion.div>

            <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute bottom-[26px] left-1/2 text-center z-20"
            >
                <div className="text-[11px] tracking-[0.28em] text-scroll-text font-mono mb-1.5">
                    SCROLL
                </div>
                <div className="text-[#3B82F6] text-[15px]">↓</div>
            </motion.div>
        </section>
    );
}

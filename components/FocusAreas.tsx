"use client";

import { CARDS } from "@/lib/constants";
import Card from "./Card";

export default function FocusAreas() {
    return (
        <section
            id="tentang"
            className="flex justify-center items-center min-h-[calc(60vh-64px)] py-20 px-[clamp(16px,4vw,56px)]"
        >
            <div className="w-full mx-auto max-w-7xl">
                <div className="text-center mb-[clamp(36px,6vw,66px)] flex flex-col items-center">
                    <div className="text-[13px] text-[#3B82F6] tracking-[0.32em] font-mono mb-[13px] font-semibold">
                        ▸ FOKUS RISET
                    </div>
                    <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-0.02em] mb-[14px] text-content font-heading">
                        Apa yang FAST Kerjakan?
                    </h2>
                    <p className="text-muted-text max-w-[440px] mx-auto leading-[1.75] text-[1.1rem]">
                        Dari investigasi artefak digital hingga pengujian
                        keamanan aktif — kami bergerak di garis terdepan siber.
                    </p>
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
                    {CARDS.map((d) => (
                        <Card key={d.n} d={d} />
                    ))}
                </div>
            </div>
        </section>
    );
}

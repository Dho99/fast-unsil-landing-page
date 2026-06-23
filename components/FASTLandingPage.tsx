"use client";

import { useState, useEffect, useRef } from "react";
import { CSS } from "@/lib/constants";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Ticker from "./Ticker";
import FocusAreas from "./FocusAreas";
import Footer from "./Footer";

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);
    const wrapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const fn = () => setScrolled(el.scrollTop > 50);
        el.addEventListener("scroll", fn);
        return () => el.removeEventListener("scroll", fn);
    }, []);

    return (
        <div
            ref={wrapRef}
            style={{
                background: "#070B18",
                color: "#fff",
                fontFamily: "system-ui, -apple-system, sans-serif",
                height: "100vh",
                overflowY: "auto",
                overflowX: "hidden",
            }}
        >
            <style>{CSS}</style>
            <Navbar scrolled={scrolled} />
            <Hero />
            <Ticker />
            <FocusAreas />
            <Footer />
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";

export default function NavbarWrapper({ activeSection }: { activeSection: string }) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", handler, { passive: true });
        return () => window.removeEventListener("scroll", handler);
    }, []);

    return <Navbar scrolled={scrolled} activeSection={activeSection} />;
}

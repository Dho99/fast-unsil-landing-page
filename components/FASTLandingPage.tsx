"use client";

import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Ticker from "./Ticker";
import FocusAreas from "./FocusAreas";
import NewsArticles from "./NewsArticles";
import Collaborators from "./Collaborators";
import Publications from "./Publications";
import TeamMembers from "./TeamMembers";
import ContactSection from "./ContactSection";
import Footer from "./Footer";

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState<string>("beranda");

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", fn);
        return () => window.removeEventListener("scroll", fn);
    }, []);

    useEffect(() => {
        const ids = ["beranda", "tentang", "riset", "anggota"];
        const observers: IntersectionObserver[] = [];

        ids.forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;
            const obs = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) setActiveSection(id);
                },
                { threshold: 0.4 },
            );
            obs.observe(el);
            observers.push(obs);
        });

        return () => observers.forEach((o) => o.disconnect());
    }, []);

    return (
        <div className="bg-surface text-content font-sans">
            <Navbar scrolled={scrolled} activeSection={activeSection} />
            <Hero />
            <Ticker />
            <FocusAreas />
            <NewsArticles />
            <Collaborators />
            <Publications />
            <TeamMembers />
            <ContactSection />
            <Footer />
        </div>
    );
}

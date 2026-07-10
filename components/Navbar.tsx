"use client";

import { useState } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { NAV, NAV_ANCHORS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar({
    scrolled,
    activeSection,
}: {
    scrolled: boolean;
    activeSection: string;
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const pathname = usePathname();

    const isInfoDiktiPage = pathname === "/info-dikti";

    return (
        <nav
            className={cn(
                "sticky top-0 z-[100] flex items-center justify-center h-16 transition-all duration-[350ms] px-[clamp(16px,4vw,56px)]",
                scrolled
                    ? "bg-white/70 dark:bg-black/70 backdrop-blur-lg border-b border-[rgba(59,130,246,0.15)]"
                    : "bg-transparent border-b-0",
            )}
        >
            <div className="container flex items-center justify-between h-full">
                <Image
                    src="/logo.png"
                    alt="Logo"
                    width={120}
                    height={36}
                    className="h-14 w-auto"
                />

                {/* Desktop links */}
                <div className="hidden md:flex gap-[clamp(14px,2.5vw,30px)]">
                    {NAV.map((l) => {
                        const sectionId = NAV_ANCHORS[l].replace("#", "");
                        const isActive = activeSection === sectionId;
                        return (
                            <Link
                                key={l}
                                href={isInfoDiktiPage ? "/" : NAV_ANCHORS[l]}
                                // href={NAV_ANCHORS[l]}
                                className={cn(
                                    "text-md tracking-[0.07em] transition-colors duration-200 relative pb-1",
                                    isActive
                                        ? "text-[#3B82F6]"
                                        : "hover:text-[#3B82F6]",
                                )}
                            >
                                {l}
                                {isActive && (
                                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#3B82F6] rounded-full" />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Desktop right section */}
                <div className="hidden md:flex items-center gap-x-5">
                    {/* Theme toggle */}
                    <button
                        onClick={() =>
                            setTheme(theme === "dark" ? "light" : "dark")
                        }
                        className="bg-transparent border-0 text-[#3B82F6] cursor-pointer p-1.5 flex items-center justify-center rounded-md transition-colors duration-200 hover:bg-[rgba(0,212,170,0.1)]"
                        aria-label="Toggle theme"
                    >
                        {theme === "dark" ? (
                            <Sun size={18} />
                        ) : (
                            <Moon size={18} />
                        )}
                    </button>

                    <Button className="bg-[#DC2626] text-white border-0 h-10 px-7 rounded-[24px] text-sm font-semibold cursor-pointer tracking-[0.07em] hover:opacity-80 hover:bg-[#DC2626] transition-opacity w-24">
                        Bergabung
                    </Button>
                </div>

                {/* Mobile hamburger + theme toggle */}
                <div className="md:hidden flex items-center gap-2">
                    <button
                        onClick={() =>
                            setTheme(theme === "dark" ? "light" : "dark")
                        }
                        className="bg-transparent border-0 text-[#3B82F6] cursor-pointer p-1 flex items-center justify-center"
                        aria-label="Toggle theme"
                    >
                        {theme === "dark" ? (
                            <Sun size={20} />
                        ) : (
                            <Moon size={20} />
                        )}
                    </button>
                    <button
                        className="bg-transparent border-0 text-[#3B82F6] cursor-pointer p-1 flex items-center justify-center"
                        onClick={() => setMenuOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu size={24} />
                    </button>
                </div>

                {/* Mobile overlay menu */}
                {menuOpen && (
                    <div className="animate-in fade-in-0 duration-200 fixed inset-0 z-[200] flex flex-col items-center justify-center gap-8 bg-[color-mix(in_srgb,var(--bg)_97%,transparent)]">
                        <button
                            className="absolute top-5 right-5 bg-transparent border-0 text-[#3B82F6] cursor-pointer p-1"
                            onClick={() => setMenuOpen(false)}
                            aria-label="Close menu"
                        >
                            <X size={24} />
                        </button>
                        {NAV.map((l, idx) => {
                            const sectionId = NAV_ANCHORS[l].replace("#", "");
                            const isActive = activeSection === sectionId;
                            return (
                                <a
                                    key={l}
                                    href={NAV_ANCHORS[l]}
                                    style={{ animationDelay: `${idx * 80}ms` }}
                                    className={cn(
                                        "animate-in fade-in-0 slide-in-from-bottom-4 text-lg tracking-[0.12em] transition-colors duration-200 hover:text-[#3B82F6]",
                                        isActive
                                            ? "text-[#3B82F6] font-semibold"
                                            : "text-subtle-text",
                                    )}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {l}
                                </a>
                            );
                        })}
                        <button
                            style={{ animationDelay: "320ms" }}
                            className="animate-in fade-in-0 slide-in-from-bottom-4 bg-[#DC2626] text-white border-0 px-8 py-3 rounded-[24px] text-sm font-semibold cursor-pointer tracking-[0.07em] mt-2 hover:opacity-80 transition-opacity"
                            onClick={() => setMenuOpen(false)}
                        >
                            Bergabung
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}

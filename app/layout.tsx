import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

// const orbitron = Orbitron({
//     subsets: ["latin"],
//     variable: "--font-heading",
// });

// const rajdhani = Rajdhani({
//     subsets: ["latin"],
//     weight: ["300", "400", "500", "600", "700"],
//     variable: "--font-sans",
// });

// const shareTechMono = Share_Tech_Mono({
//     subsets: ["latin"],
//     weight: "400",
//     variable: "--font-mono",
// });

const geist = Geist({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-sans",
});

export const metadata: Metadata = {
    title: "FAST — Forensic and Security Research Group",
    description:
        "Komunitas riset keamanan digital Universitas Siliwangi — forensik, penetration testing, dan penelitian siber.",
    alternates: {
        types: {
            "application/rss+xml": [
                {
                    url: "https://fast.unsil.ac.id/rss",
                    title: "FAST UNSIL – Agregasi Berita Dikti",
                },
                {
                    url: "https://fast.unsil.ac.id/rss/publications",
                    title: "FAST UNSIL – Publikasi Ilmiah",
                },
            ],
        },
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={cn(
                "h-full",
                "antialiased",
                // orbitron.variable,
                // rajdhani.variable,
                // shareTechMono.variable,
                geist.variable,
                "font-sans",
            )}
            suppressHydrationWarning
        >
            <body className="w-dvw h-dvh ">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <SidebarProvider defaultOpen={false}>
                        <AppSidebar />
                        <div className="flex-1 overflow-auto">{children}</div>
                    </SidebarProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}

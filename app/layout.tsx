import type { Metadata } from "next";
// import { Orbitron, Rajdhani, Share_Tech_Mono } from "next/font/google";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { cn } from "@/lib/utils";

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
            <body className="min-h-full flex flex-col">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}

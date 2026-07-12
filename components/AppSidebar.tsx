"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { NAV, NAV_ANCHORS } from "@/lib/constants";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppSidebar() {
    const pathname = usePathname();

    const isInfoDiktiPage = pathname === "/info-dikti";

    return (
        <Sidebar collapsible="offcanvas">
            <SidebarHeader>
                <div className="flex items-center px-4 py-3">
                    {/* <Image
                        src="/logo.png"
                        alt="FAST"
                        width={120}
                        height={36}
                        className="h-10 w-auto"
                    /> */}
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1 px-2">
                            {NAV.map((label) => {
                                const href =
                                    label === "Beranda" ||
                                    label === "Info Dikti"
                                        ? NAV_ANCHORS[label]
                                        : isInfoDiktiPage
                                          ? "/"
                                          : NAV_ANCHORS[label];

                                const isActive =
                                    label === "Beranda"
                                        ? pathname === "/"
                                        : label === "Info Dikti"
                                          ? pathname === "/info-dikti"
                                          : false;

                                return (
                                    <SidebarMenuItem key={label}>
                                        <SidebarMenuButton
                                            isActive={isActive}
                                            render={<Link href={href} />}
                                            className="h-12 hover:text-[#3B82F6]"
                                        >
                                            <span
                                                className={cn(
                                                    "text-lg tracking-[0.12em]",
                                                    isActive
                                                        ? "text-[#3B82F6] font-semibold"
                                                        : "text-subtle-text",
                                                )}
                                            >
                                                {label}
                                            </span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <div className="px-4 py-3">
                    <Button className="w-full bg-[#DC2626] text-white hover:bg-[#DC2626]/80 rounded-[24px] text-sm font-semibold tracking-[0.07em] cursor-pointer">
                        Bergabung
                    </Button>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}

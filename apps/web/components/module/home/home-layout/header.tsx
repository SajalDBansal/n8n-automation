"use client";
import { ThemeToggle } from "@/components/theme-toggler";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@workspace/ui/components/breadcrumb";
import { Separator } from "@workspace/ui/components/separator";
import { SidebarTrigger } from "@workspace/ui/components/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchBar from "./search-bar";

export default function AppHeader() {
    const pathname = usePathname()
    const segments = pathname.split("/").filter(Boolean)

    const routeNames: Record<string, string> = {
        dashboard: "Dashboard",
        habits: "Habits",
        "create-habit": "Create Habit",
    }

    const breadcrumbs = segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/")
        // const label = decodeURIComponent(segment)
        const label = routeNames[segment] ?? segment
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())

        return { href, label }
    })

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 justify-between">
            <div className="flex items-center justify-center">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4 my-auto"
                />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/">Home</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>

                        {breadcrumbs.map((crumb, index) => (
                            <div key={crumb.href} className="flex items-center gap-x-2">
                                <BreadcrumbSeparator />

                                <BreadcrumbItem>
                                    {index === breadcrumbs.length - 1 ? (
                                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <Link href={crumb.href}>{crumb.label}</Link>
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                            </div>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className="flex items-center justify-center gap-2">
                <SearchBar />
                <ThemeToggle />
            </div>

        </header>
    )
}
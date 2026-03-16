import * as React from "react"
import { Layers, LayoutDashboard, LockKeyhole, Plus, Settings, Waypoints } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@workspace/ui/components/sidebar"
import Link from "next/link"
import { NavUser } from "./sidebar-user"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import ProjectsList from "./projects-list"

const navigationData = [
    {
        name: "Dashboard",
        link: "/dashboard",
        icon: LayoutDashboard
    }, {
        name: "Projects",
        link: "/projects",
        icon: Layers
    }
    , {
        name: "Workflows",
        link: "/workflows",
        icon: Waypoints
    }
    , {
        name: "Credentials",
        link: "/credentials",
        icon: LockKeyhole
    },
    {
        name: "Settings",
        link: "/settings",
        icon: Settings
    }
];

export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) return null;

    const normalizedUser = {
        id: session.user.id,
        name: session.user.name ?? "Anonymous",
        email: session.user.email ?? "",
        image: session.user.image ?? "/default-avatar.png",
    };

    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="#">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground bg-orange-400">
                                    <Waypoints className="size-5!" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-medium">n8n-Automate</span>
                                    <span className="text-muted-foreground">v1.0.0</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                {/* <SearchForm /> */}
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navigationData.map((item, index) => (
                                <Link key={index} href={item.link}>
                                    <SidebarMenuItem >
                                        <SidebarMenuButton>
                                            <item.icon />
                                            {item.name}
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </Link>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Files</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <ProjectsList />
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={normalizedUser} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}



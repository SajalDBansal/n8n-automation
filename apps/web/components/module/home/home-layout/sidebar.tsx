import * as React from "react"
import { ChevronRight, File, Folder, Layers, LayoutDashboard, LockKeyhole, LucideIcon, Plus, Settings, Waypoints, Workflow } from "lucide-react"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarRail,
} from "@workspace/ui/components/sidebar"
import Link from "next/link"
import { NavUser } from "./sidebar-user"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ProjectNavigatorType } from "@workspace/types"

const iconMap = {
    layers: Layers
}

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



const projectsData: ProjectNavigatorType[] = [
    {
        id: "project-1",
        name: "My Project",
        type: "PERSONAL",
        icon: { type: "icon", value: "layers" },
        workflows: [
            { name: "New Workflow", id: "workflow-1" },
            { name: "New Workflow", id: "workflow-2" }
        ]
    },
    {
        id: "project-2",
        name: "My Project",
        type: "PERSONAL",
        icon: { type: "icon", value: "layers" },
        workflows: [
            { name: "New Workflow", id: "workflow-3" },
            { name: "New Workflow", id: "workflow-4" }
        ]
    },
    {
        id: "project-3",
        name: "My Project",
        type: "PERSONAL",
        icon: { type: "icon", value: "layers" },
        workflows: [
            { name: "New Workflow", id: "workflow-3" }
        ]
    },
    {
        id: "project-4",
        name: "My Project",
        type: "PERSONAL",
        icon: { type: "icon", value: "layers" },
        workflows: []
    },
    {
        id: "project-5",
        name: "My Project",
        type: "PERSONAL",
        icon: { type: "icon", value: "layers" },
        workflows: []
    }
]

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
                        <SidebarMenu>
                            {projectsData.map((item) => (
                                <Tree key={item.id} item={item} />
                            ))}
                            <SidebarMenuItem >
                                <SidebarMenuButton>
                                    <Plus />
                                    Add Project
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
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

function Tree({ item }: { item: ProjectNavigatorType }) {
    const Icon = item.icon.type === "icon" ? iconMap[item.icon.value as keyof typeof iconMap] ?? Layers : Layers;

    return (
        <SidebarMenuItem>
            <Collapsible
                className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
            >
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                        <ChevronRight className="transition-transform" />
                        {
                            item.icon.type === "icon" && (
                                <Icon />
                            )
                        }
                        {item.name}
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {
                            item.workflows.length > 0 && (
                                item.workflows.map((flow) =>
                                    <Link key={flow.id} href={`/projects/${item.id}/workflows/${flow.id}`}>
                                        <SidebarMenuButton className="data-[active=true]:bg-transparent"
                                        >
                                            <Workflow />
                                            {flow.name}
                                        </SidebarMenuButton>
                                    </Link>
                                )
                            )
                        }

                        <SidebarMenuButton className="data-[active=true]:bg-transparent text-muted-foreground"
                        >
                            <Plus />
                            New Workflow
                        </SidebarMenuButton>

                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>
        </SidebarMenuItem>
    )
}

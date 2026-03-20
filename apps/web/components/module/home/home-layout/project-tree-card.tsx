import { ProjectNavigatorType } from "@workspace/types";
import * as React from "react"
import { ChevronRight, Layers, Plus, Workflow } from "lucide-react"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import {
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
} from "@workspace/ui/components/sidebar"
import Link from "next/link"
import { createWorkflowOptimistic } from "@/action/client/workflow";

const iconMap = {
    layers: Layers
}

export default function Tree({ item }: { item: ProjectNavigatorType }) {
    const Icon = item.icon.type === "ICON" ? iconMap[item.icon.value as keyof typeof iconMap] ?? Layers : Layers;

    return (
        <SidebarMenuItem>
            <Collapsible
                className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
            >
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                        <ChevronRight className="transition-transform" />
                        {
                            item.icon.type === "ICON" && (
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
                                    <Link key={flow.id} href={`/projects/${item.id}/${flow.id}`}>
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
                            onClick={() => createWorkflowOptimistic(item.id, {})}
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
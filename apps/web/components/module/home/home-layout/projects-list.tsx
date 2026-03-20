"use client";
import { useProjectStore } from "@/store/projects";
import { ProjectNavigatorType } from "@workspace/types";
import Tree from "./project-tree-card";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@workspace/ui/components/sidebar";
import { Plus } from "lucide-react";
import { createProjectOptimistic, getAllProjectsOptimistic } from "@/action/client/project";
import { useEffect } from "react";

export default function ProjectsList() {
    const { projects } = useProjectStore();

    useEffect(() => {

        const run = async () => {
            await getAllProjectsOptimistic();
        };

        run();
    }, [getAllProjectsOptimistic]);

    const projectsData: ProjectNavigatorType[] = projects ? projects?.map(project => ({
        id: project.id,
        name: project.name,
        type: project.type,
        icon: project.icon || { type: "ICON", value: "layers" },
        workflows: project.workflows || []
    })) : [];

    const handleCreateButton = async () => {
        await createProjectOptimistic({
            name: "My Project",
            type: "PERSONAL",
        })
    }

    return (
        <>
            <SidebarMenu>
                {
                    projectsData.map((item) => (
                        <Tree key={item.id} item={item} />
                    ))
                }
                <SidebarMenuItem >
                    <SidebarMenuButton onClick={handleCreateButton}>
                        <Plus />
                        Add Project
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>

        </>
    )
}
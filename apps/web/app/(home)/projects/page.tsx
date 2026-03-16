import ProjectsCard from "@/components/module/home/projects/projects-list";
import { Button } from "@workspace/ui/components/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function NewProjectsPage() {
    return (
        <div className="flex flex-1 flex-col gap-4 w-full max-w-7xl mx-auto h-full overflow-hidden p-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground">Manage your workspace projects.</p>
                </div>
                <Button className="rounded-xl">
                    <Link href="/projects/new" className="flex items-center justify-center">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Project
                    </Link>
                </Button>
            </div>

            <ProjectsCard />
        </div>
    )
}
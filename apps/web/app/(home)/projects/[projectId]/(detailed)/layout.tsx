import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation";
import ProjectOverviewStats from "@/components/module/home/projects/project-overview-stats";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft, Calendar, Layers, Plus, Settings, Waypoints } from "lucide-react";
import Link from "next/link";
import { getProjectOverviewStats } from "@/lib/db-calls";
import TabsView from "@/components/module/home/projects/tabs-view";

export default async function ProjectLayout(
    { children, params }:
        { children: React.ReactNode, params: Promise<{ projectId: string }>, }) {
    const { projectId } = await params;
    const session = await getServerSession(authOptions);
    if (!session) redirect("/signin");


    const overviewStats = await getProjectOverviewStats(projectId);

    const project = {
        name: overviewStats.projectDetails.name,
        description: overviewStats.projectDetails.description,
        type: overviewStats.projectDetails.type,
        createdAt: overviewStats.projectDetails.createdAt || new Date().toISOString(),
    }

    const formattedDate = new Date(project.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full">
            <div className="flex flex-col gap-4">
                <Link href="/projects" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 w-fit">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Projects
                </Link>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl mt-1">
                            <Layers className="h-8 w-8 text-primary" />
                        </div>
                        <div className="">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">{project.type}</Badge>
                            </div>
                            <p className="text-muted-foreground mt-1 max-w-2xl">
                                {project.description}
                            </p>
                            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />Created {formattedDate}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/projects/${projectId}/new`}>
                            <Button className="rounded-xl shadow-sm hover:shadow-[0_0_15px_rgba(var(--primary),0.3)] transition-shadow">
                                <Plus />
                                New Workflow
                            </Button>
                        </Link>
                        <Link href={`/projects/${projectId}/settings`}>
                            <Button className="rounded-xl shadow-sm hover:shadow-[0_0_15px_rgba(var(--primary),0.3)] transition-shadow">
                                <Settings />
                                Settings
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <ProjectOverviewStats stats={overviewStats} />
            </div>

            <div className="flex flex-col gap-4">

                <TabsView projectId={projectId} />

                <div className="pt-4 pb-8 min-h-100">
                    {children}
                </div>
            </div>
        </div>

    )
}
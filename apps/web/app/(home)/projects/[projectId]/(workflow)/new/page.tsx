import CreateWorkflowCard from "@/components/module/home/projects/create-workflow-card";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ProjectNewWorkflowPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;

    return (
        <div className="flex flex-1 flex-col gap-4 w-full max-w-3xl mx-auto h-full overflow-hidden p-2">
            <div className="flex gap-4 items-center">
                <Link href={`/projects/${projectId}`}>
                    <Button variant="ghost" size="icon" className="rounded-full shrink-0">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <div className="flex flex-col md:gap-2">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Add Workflow</h1>
                    <p className=" text-muted-foreground">Create a new workflow in your project.</p>
                </div>
            </div>

            <CreateWorkflowCard projectId={projectId} />
        </div>
    )
}
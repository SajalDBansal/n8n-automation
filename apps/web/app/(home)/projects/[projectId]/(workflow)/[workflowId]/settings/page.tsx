"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useParams } from "next/navigation";
import Link from "next/link";
import UpdateWorkflowCard from "@/components/module/home/workflows/update-workflow-card";

export default function WorkflowSettinsPage() {
    const { projectId, workflowId }: { projectId: string, workflowId: string } = useParams();

    return (
        <div className="flex flex-1 flex-col gap-4 w-full max-w-3xl mx-auto h-full overflow-hidden p-2">
            <div className="flex gap-4 items-center">
                <Link href={`/projects/${projectId}/${workflowId}`}>
                    <Button variant="ghost" size="icon" className="rounded-full shrink-0">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <div className="flex flex-col md:gap-2">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Workflow Settings</h1>
                    <p className=" text-muted-foreground">Manage your workflow preferences and information.</p>
                </div>
            </div>

            <UpdateWorkflowCard projectId={projectId} workflowId={workflowId} />
        </div>
    )
}
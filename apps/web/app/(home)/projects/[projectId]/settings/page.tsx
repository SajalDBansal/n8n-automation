"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useParams } from "next/navigation";
import Link from "next/link";
import UpdateProjectCard from "@/components/module/home/projects/update-project-card";

export default function ProjectSettingsPage() {
    const { projectId }: { projectId: string } = useParams();

    return (
        <div className="flex flex-1 flex-col gap-4 w-full max-w-3xl mx-auto h-full overflow-hidden p-2">
            <div className="flex gap-4 items-center">
                <Link href={`/projects/${projectId}`}>
                    <Button variant="ghost" size="icon" className="rounded-full shrink-0">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <div className="flex flex-col md:gap-2">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Project Settings</h1>
                    <p className=" text-muted-foreground">Manage your project preferences and information.</p>
                </div>
            </div>

            <UpdateProjectCard projectId={projectId} />
        </div>
    )
}
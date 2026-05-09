import CreateProjectCard from "@/components/module/home/projects/create-project-card";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewProjectPage() {
    return (
        <div className="flex flex-1 flex-col gap-4 w-full max-w-3xl mx-auto h-full overflow-hidden p-2">
            <div className="flex gap-4 items-center">
                <Link href={"/projects"}>
                    <Button variant="ghost" size="icon" className="rounded-full shrink-0">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <div className="flex flex-col md:gap-2">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Add Project</h1>
                    <p className=" text-muted-foreground">Create a new project for your workflows.</p>
                </div>
            </div>

            <CreateProjectCard />
        </div>
    )
}
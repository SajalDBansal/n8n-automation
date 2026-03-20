import WorkflowCards from "@/components/module/home/workflows/workflow-cards";

export default function WorkflowsPage() {
    return (
        <div className="flex flex-1 flex-col gap-4 w-full max-w-7xl mx-auto h-full overflow-hidden p-2">

            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">All Workflows</h1>
                <p className="text-muted-foreground">Manage your automation workflows across all projects.</p>
            </div>

            <WorkflowCards />

        </div>
    )
}
import WorkflowExecutionsTable from "@/components/module/home/workflows/executions-table";
import { getWorkflowById } from "@/lib/db-calls";
import { Button } from "@workspace/ui/components/button";
import { Activity, ArrowLeft, Calendar, CircleCheck, Play, Settings, TriangleAlert } from "lucide-react";
import Link from "next/link";

export default async function ProjectWorkflowIdPage({ params }: { params: Promise<{ workflowId: string, projectId: string }> }) {
    const { workflowId, projectId } = await params;
    const response = await getWorkflowById(projectId, workflowId);
    if (!response) return null;

    const workflow = response.workflow;
    const executionCount = response.executionCount;


    const formatDate = (dateString: Date | null) => {
        if (!dateString) return '—';

        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) {
            return 'Just now';
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes} min ago`;
        } else if (diffInMinutes < 24 * 60) {
            const hours = Math.floor(diffInMinutes / 60);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full">
            <div className="flex flex-col gap-4">
                <Link href="/workflows" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 w-fit">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Workflows
                </Link>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 p-4 border rounded-2xl shadow-sm">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">{workflow.name}</h1>

                            {workflow.active == true ? (
                                <div className="flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded-md border font-medium bg-green-500/40 text-green-500 border-green-500/20">
                                    <CircleCheck className="h-3 w-3" />
                                    <span className="truncate max-w-20">Active</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded-md border  font-medium bg-destructive/10 text-destructive border-destructive/20">
                                    <TriangleAlert className="h-3 w-3" />
                                    <span className="truncate max-w-20">Inactive</span>
                                </div>
                            )}

                        </div>
                        <p className="text-muted-foreground mt-1 max-w-2xl">
                            {workflow.description || "--"}
                        </p>
                        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Created {formatDate(workflow.createdAt)}</span>
                            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Updated {formatDate(workflow.updatedAt)}</span>
                            <span className="flex items-center gap-1.5"><Activity className="h-4 w-4" /> {executionCount} Total Runs</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/projects/${projectId}/${workflowId}/settings`}>
                            <Button variant="outline" className="rounded-xl border border-border/50 hover:bg-muted transition-colors">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Button>
                        </Link>
                        <Link href={`/projects/${projectId}/${workflowId}/edit`} className="flex">
                            <Button className="rounded-xl shadow-sm hover:shadow-[0_0_15px_rgba(var(--primary),0.3)] transition-shadow">
                                <Play className="mr-2 h-4 w-4" />
                                Open Editor
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>


            {/* executions table */}
            <WorkflowExecutionsTable workflowId={workflowId} />
        </div>
    )
}
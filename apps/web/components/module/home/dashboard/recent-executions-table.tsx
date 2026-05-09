"use client";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Activity, TriangleAlert } from "lucide-react";
import Link from "next/link";
import type { RecentExecutionRow } from "@/lib/db-calls";

const getStatusColor = (status: string) => {
    switch (status) {
        case "SUCCESS":
        case "FINISHED":
            return "text-green-600 bg-green-500/10 border-green-500/20";
        case "ERROR":
        case "CRASHED":
            return "text-red-600 bg-red-500/10 border-red-500/20";
        case "RUNNING":
        case "STARTING":
            return "text-blue-600 bg-blue-500/10 border-blue-500/20";
        default:
            return "text-muted-foreground bg-muted/40 border-border/40";
    }
};

const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
};

export default function RecentExecutionTable({ executions }: { executions: RecentExecutionRow[] }) {
    const activeCount = executions.filter((e) => e.status === "RUNNING" || e.status === "STARTING").length;

    return (
        <motion.div
            className="col-span-full md:col-span-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
        >
            <Card className="bg-background/50 backdrop-blur-xl border-border/50 h-full">
                <CardHeader>
                    <CardTitle>Recent Executions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col justify-between h-full">

                    {executions.length === 0 ? (
                        <div className="flex flex-1 flex-col items-center justify-center text-center px-6">
                            <div className="p-3 rounded-full bg-muted/50 mb-4">
                                <TriangleAlert className="h-5 w-5 text-muted-foreground" />
                            </div>

                            <p className="text-sm font-medium text-foreground">
                                No execution data available
                            </p>

                            <p className="text-xs text-muted-foreground mt-1">
                                Execution activity will appear here once processes start running.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col divide-y divide-border/40">
                            {executions.map((execution) => (
                                <Link
                                    key={execution.id}
                                    href={`/projects/${execution.projectId}/${execution.workflowId}`}
                                    className="flex items-center justify-between gap-3 py-3 hover:bg-muted/30 rounded-lg px-2 -mx-2 transition-colors"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">{execution.workflowName}</p>
                                        <p className="text-xs text-muted-foreground truncate">{execution.projectName} · {formatRelativeTime(execution.createdAt)}</p>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-md border shrink-0 ${getStatusColor(execution.status)}`}>
                                        {execution.status}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Status Footer */}
                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 mt-6 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        <span className="text-sm text-primary font-medium">
                            {activeCount > 0 ? `${activeCount} active execution${activeCount === 1 ? "" : "s"}` : "No active executions"}
                        </span>
                    </div>

                </CardContent>
            </Card>
        </motion.div>
    )
}

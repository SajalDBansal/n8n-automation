"use client";
import TabViewCard from "@/components/module/home/projects/tab-view-card";
import { useExecutions } from "@/hooks/use-executions";
import { ExecutionStatusType } from "@workspace/types";
import { Button } from "@workspace/ui/components/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { AlertCircle, CheckCircle, Clock, FileQuestion, Loader, MoreHorizontal, Play, X, XCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function WorkflowExecutionsTable({ workflowId }: { workflowId: string }) {
    const [statusFilter, setStatusFilter] = useState<string>("");
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const { projectId }: { projectId: string } = useParams();

    const { executions, loading, loadingMore, error, hasMore, totalCount, loadMore } = useExecutions({ workflowId, projectId, limit: 10, status: statusFilter || undefined, refreshInterval: 5000 })

    useEffect(() => {
        if (!loadMoreRef.current || loading || loadingMore || !hasMore) return;

        const observe = new IntersectionObserver((entries) => {
            if (entries[0]?.isIntersecting) loadMore();
        }, { threshold: 0.1 });

        observe.observe(loadMoreRef.current);

        return () => observe.disconnect();
    }, [loading, loadingMore, hasMore, loadMore]);

    const getStatusIcon = (status: ExecutionStatusType) => {
        switch (status) {
            case "SUCCESS":
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case "ERROR":
                return <XCircle className="w-4 h-4 text-red-500" />;
            case "RUNNING":
                return <Loader className="w-4 h-4 text-blue-500 animate-spin" />;
            case "STARTING":
                return <Play className="w-4 h-4 text-blue-500" />;
            case "CANCELLED":
                return <X className="w-4 h-4 text-gray-500" />;
            case "CRASHED":
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: ExecutionStatusType) => {
        switch (status) {
            case "SUCCESS":
                return 'text-green-600';
            case "ERROR":
            case "CRASHED":
                return 'text-red-600';
            case "RUNNING":
            case "STARTING":
                return 'text-blue-600';
            case "CANCELLED":
                return 'text-gray-600';
            default:
                return 'text-gray-600';
        }
    };

    const formatDate = (dateString: string | null) => {
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

    const activeExecutions = executions.filter(ex => ex.status === "RUNNING" || ex.status === "STARTING").length;

    return (
        <TabViewCard >
            <Card className="bg-background/50 backdrop-blur-xl border-border/50">
                <CardHeader>
                    <CardTitle>Project Executions</CardTitle>
                    <CardDescription>Recent runs across all workflows in this project.</CardDescription>
                    <CardAction>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-between gap-4">
                                <span className="text-sm text-gray-500">
                                    {activeExecutions === 0 ? 'No active executions' : `${activeExecutions} active execution${activeExecutions > 1 ? 's' : ''}`}
                                </span>
                            </div>
                        </div>
                    </CardAction>
                </CardHeader>
                <CardContent className="min-h-75 flex items-center justify-center border-t border-border/50 bg-muted/5 p-4">

                    {/* 🔄 Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-8 h-40 text-muted-foreground">
                            <Loader className="w-6 h-6 animate-spin text-gray-500" />
                            <span className="ml-2 text-gray-500">Loading executions...</span>
                        </div>
                    )}

                    {/* 🔄 Error State */}
                    {error && (
                        <div className="flex items-center justify-center py-8 h-40  text-muted-foreground">
                            <AlertCircle className="w-6 h-6 text-red-500" />
                            <span className="ml-2 text-red-600">{error}</span>
                        </div>
                    )}

                    {/* 📭 Empty State */}
                    {!loading && executions.length === 0 ? (
                        <div className="flex items-center justify-center py-8 h-40 text-muted-foreground">
                            <FileQuestion className="w-6 h-6 " />
                            <span className="ml-2 text-red-600">No executions found for this project.</span>
                        </div>
                    ) :
                        <div className="border border-gray-200 rounded-lg overflow-hidden w-full">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Workflow</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Started</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Run Time</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Exec. ID</th>
                                        <th className="w-8"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {
                                        executions.map((execution, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${execution.status === "SUCCESS" ? 'bg-green-500' :
                                                            execution.status === 'ERROR' || execution.status === 'CRASHED' ? 'bg-red-500' :
                                                                execution.status === 'RUNNING' || execution.status === 'STARTING' ? 'bg-blue-500' :
                                                                    'bg-gray-400'
                                                            }`}></div>
                                                        <span className="text-sm text-gray-900">{execution.workflowName}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(execution.status)}
                                                        <span className={`text-sm ${getStatusColor(execution.status)}`}>
                                                            {execution.status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-sm text-gray-600">
                                                        {formatDate(execution.startedAt)}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-sm text-gray-600">
                                                        {execution.runtimeFormatted}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-600">{execution?.id}</span>
                                                        {(execution.status === 'ERROR' || execution.status === 'CRASHED') && (
                                                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>

                            {/* Load More / Infinite Scrolling Section */}
                            {executions.length > 0 && (
                                <div className="border-t border-gray-200">
                                    {hasMore ? (
                                        <div
                                            ref={loadMoreRef}
                                            className="text-center py-6"
                                        >
                                            {loadingMore ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <Loader className="w-4 h-4 animate-spin text-gray-500" />
                                                    <span className="text-sm text-gray-500">Loading more executions...</span>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    onClick={loadMore}
                                                    className="text-sm bg-orange-500 hover:bg-orange-600 text-white border-orange-500 hover:border-orange-600"
                                                    disabled={loadingMore}
                                                >
                                                    <Loader className="w-4 h-4 mr-2" />
                                                    Load more
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-gray-500 text-sm">
                                            {executions.length === totalCount ? (
                                                <span>No more executions to fetch</span>
                                            ) : (
                                                <span>Showing {executions.length} of {totalCount} executions</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    }

                </CardContent>
            </Card>

        </TabViewCard>
    )
}
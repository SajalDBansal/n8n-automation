"use client";
import { getWorkflows } from "@/action/db/workflow";
import TabViewCard from "@/components/module/home/projects/tab-view-card";
import { WorkflowCard } from "@/components/module/home/projects/workflow-card";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type WorkflowResult = {
    active: boolean;
    projectId: string;
    id: string;
    name: string;
    description: string | null;
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export default function ProjectIdPage() {
    const [loading, setLoading] = useState(false);
    const [workflows, setWorkflows] = useState<WorkflowResult[]>([]);
    const { projectId }: { projectId: string } = useParams();


    useEffect(() => {
        const run = async () => {
            try {
                setLoading(true);
                const res = await getWorkflows(projectId);

                if (!res.success) throw new Error(res.message);

                setWorkflows(res.workflows ?? []);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        run();
    }, [projectId]);

    return (
        <TabViewCard >
            {/* 🔄 Loading State */}
            {loading && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-32 rounded-xl bg-muted animate-pulse"
                        />
                    ))}
                </div>
            )}

            {/* 📭 Empty State */}
            {!loading && workflows.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-lg font-semibold">
                        No workflows found
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Create your first workflow to get started.
                    </p>
                </div>
            )}

            {/* ✅ Data State */}
            {!loading && workflows.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {workflows.map((wf, i) => (
                        <motion.div
                            key={wf.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1, duration: 0.3 }}
                        >
                            <WorkflowCard
                                id={wf.id}
                                name={wf.name}
                                description={wf.description || ""}
                                isActive={wf.active as any}
                                updatedAt={wf.updatedAt}
                            />
                        </motion.div>
                    ))}
                </div>
            )}

        </TabViewCard>
    )
}
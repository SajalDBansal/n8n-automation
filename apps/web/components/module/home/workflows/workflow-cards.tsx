"use client";
import { getAllWorkflows } from "@/action/db/workflow";
import { WorkflowsResponseType } from "@workspace/types";
import { AnimatePresence, motion } from "framer-motion";
import { Workflow } from "lucide-react";
import { useEffect, useState } from "react";
import { WorkflowCard } from "../projects/workflow-card";

export default function WorkflowCards() {
    const [loading, setLoading] = useState(false);
    const [workflows, setworkflows] = useState<WorkflowsResponseType[]>([]);

    useEffect(() => {
        const run = async () => {
            try {
                setLoading(true);
                const res = await getAllWorkflows();

                if (!res.success) throw new Error(res.message);

                setworkflows(res.workflows ?? []);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        run();
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    return (

        <AnimatePresence mode="wait">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.4, duration: 0.2 }}
            >

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
                    <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border/50 rounded-2xl">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                            <Workflow className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-semibold tracking-tight">No projects yet</h3>
                        <p className="mb-6 mt-2 text-muted-foreground max-w-sm">
                            You haven't created any projects. Group your workflows together by creating your first project.
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
                                    projectId={wf.projectId}
                                    id={wf.id}
                                    name={wf.name}
                                    description={wf.description || ""}
                                    isActive={wf.active as any}
                                    updatedAt={wf.updatedAt}
                                    projectName={wf.project.name}
                                />
                            </motion.div>
                        ))}
                    </div>
                )}



            </motion.div>
        </AnimatePresence>
    )
}
"use client";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Activity, TriangleAlert } from "lucide-react";

// TODO : Add logic to show last 5 executions
export default function RecentExecutionTable() {
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

                    {/* Empty State */}
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

                    {/* Status Footer */}
                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 mt-6 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        <span className="text-sm text-primary font-medium">
                            No active executions
                        </span>
                    </div>

                </CardContent>
            </Card>
        </motion.div>
    )
}
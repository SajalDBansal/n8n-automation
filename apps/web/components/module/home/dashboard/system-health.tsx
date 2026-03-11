"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { motion } from "framer-motion";
import { Activity, TriangleAlert } from "lucide-react";

export default function SystemHealth() {
    return (
        <motion.div
            className="col-span-full md:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
        >
            <Card className="bg-background/50 backdrop-blur-xl border-border/50 h-full">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">
                        System Health
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col justify-between h-full">

                    {/* Empty State */}
                    <div className="flex flex-1 flex-col items-center justify-center text-center px-6">
                        <div className="p-3 rounded-full bg-muted/50 mb-4">
                            <TriangleAlert className="h-5 w-5 text-muted-foreground" />
                        </div>

                        <p className="text-sm font-medium text-foreground">
                            No system data available
                        </p>

                        <p className="text-xs text-muted-foreground mt-1">
                            System metrics will appear here once activity is detected.
                        </p>
                    </div>

                    {/* Status Footer */}
                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 mt-6 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        <span className="text-sm text-primary font-medium">
                            All systems operational
                        </span>
                    </div>

                </CardContent>
            </Card>
        </motion.div>
    )

}
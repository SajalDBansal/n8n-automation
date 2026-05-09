"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { motion } from "framer-motion";
import { Activity, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

type HealthChecks = {
    database: boolean;
    redis: boolean;
};

export default function SystemHealth() {
    const [checks, setChecks] = useState<HealthChecks | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            try {
                const res = await fetch("/api/health");
                const data = await res.json();
                if (!cancelled) setChecks(data.checks ?? null);
            } catch {
                if (!cancelled) setChecks({ database: false, redis: false });
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        run();
        return () => { cancelled = true; };
    }, []);

    const allHealthy = checks ? checks.database && checks.redis : false;

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

                    {loading ? (
                        <div className="flex flex-1 flex-col items-center justify-center text-center px-6">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                                <span className="text-sm text-muted-foreground">Database</span>
                                {checks?.database ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                    <XCircle className="h-4 w-4 text-destructive" />
                                )}
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                                <span className="text-sm text-muted-foreground">Redis</span>
                                {checks?.redis ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                    <XCircle className="h-4 w-4 text-destructive" />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Status Footer */}
                    <div className={`p-4 rounded-xl border mt-6 flex items-center gap-2 ${allHealthy ? "bg-primary/5 border-primary/10" : "bg-destructive/5 border-destructive/20"}`}>
                        <Activity className={`h-4 w-4 ${allHealthy ? "text-primary" : "text-destructive"}`} />
                        <span className={`text-sm font-medium ${allHealthy ? "text-primary" : "text-destructive"}`}>
                            {loading ? "Checking systems..." : allHealthy ? "All systems operational" : "One or more systems degraded"}
                        </span>
                    </div>

                </CardContent>
            </Card>
        </motion.div>
    )

}

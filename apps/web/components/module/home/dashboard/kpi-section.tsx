"use client";

import { motion } from "framer-motion"
import { OVERVIEW_STATS_BASE_DATA } from "@/utils/base-data";
import { OverviewStatsPageDataType } from "@workspace/types";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { LucideIcon } from "lucide-react";

export default function OverviewStats({ stats }: { stats: OverviewStatsPageDataType }) {
    return (
        <>
            {OVERVIEW_STATS_BASE_DATA.map((stat, i) => (
                <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                    <StatCard
                        title={stat.title}
                        value={stats[stat.id]}
                        description={stat.description}
                        icon={stat.icon}
                    />
                </motion.div>
            ))}
        </>
    )

}

interface StatCardProps {
    title: string;
    value: number;
    description: string;
    icon: LucideIcon;
    trend?: "up" | "down" | "neutral";
}

function StatCard({ title, value, description, icon: Icon, trend = "neutral" }: StatCardProps) {
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="relative overflow-hidden group bg-background/50 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-md transition-shadow gap-2">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                    <div className="p-2 bg-primary/10 rounded-md">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold tracking-tight">{value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {description}
                    </p>
                </CardContent>
            </Card>
        </motion.div>
    );
}
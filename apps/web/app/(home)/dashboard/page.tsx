import OverviewStats from "@/components/module/home/dashboard/kpi-section"
import RecentExecutionTable from "@/components/module/home/dashboard/recent-executions-table"
import SystemHealth from "@/components/module/home/dashboard/system-health"
import { getDashboardOverviewStats, getRecentExecutions } from "@/lib/db-calls"

export default async function DashboardPage() {
    const [overviewStats, recentExecutions] = await Promise.all([
        getDashboardOverviewStats(),
        getRecentExecutions(5),
    ]);

    return (
        <div className="flex flex-1 flex-col gap-4 w-full max-w-7xl mx-auto h-full overflow-hidden p-2">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
                <p className="text-muted-foreground">Monitor your automation performance and recent activity.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <OverviewStats stats={overviewStats} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
                <RecentExecutionTable executions={recentExecutions} />
                <SystemHealth />
            </div>
        </div>
    )
}
import OverviewStats from "@/components/module/home/dashboard/kpi-section"
import RecentExecutionTable from "@/components/module/home/dashboard/recent-executions-table"
import SystemHealth from "@/components/module/home/dashboard/system-health"
import { OverviewStatsPageDataType } from "@workspace/types"

// TODO : convert to real data
const OVERVIEW_STATS_DATA: OverviewStatsPageDataType = {
    totalWorkflows: 24,
    totalExecutionsToday: 1246,
    activeProjects: 7,
    failedExecutionToday: 3
}

export default function DashboardPage() {
    return (
        <div className="flex flex-1 flex-col gap-4 w-full max-w-7xl mx-auto h-full overflow-hidden p-2">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
                <p className="text-muted-foreground">Monitor your automation performance and recent activity.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <OverviewStats stats={OVERVIEW_STATS_DATA} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
                <RecentExecutionTable />
                <SystemHealth />
            </div>
        </div>
    )
}
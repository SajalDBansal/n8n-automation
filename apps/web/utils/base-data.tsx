import { OverviewStatsPageType, ProjectOverviewStatsPageType } from "@workspace/types";
import { AlertTriangle, FolderKanban, Waypoints, Activity, KeyRound } from "lucide-react";

export const OVERVIEW_STATS_BASE_DATA: OverviewStatsPageType[] = [
    {
        id: "activeProjects",
        title: "Active Projects",
        description: "Total active projects",
        icon: FolderKanban,
    }, {

        id: "totalWorkflows",
        title: "Total Workflows",
        description: "Actice Workflows Available",
        icon: Waypoints,
    },
    {
        id: "totalExecutionsToday",
        title: "Executions Today",
        description: "Execution in last 24h",
        icon: Activity,
    },
    {
        id: "failedExecutionToday",
        title: "Failed Runs",
        description: "In the last 24 hours",
        icon: AlertTriangle,
    },
]

export const PROJECT_OVERVIEW_STATS_BASE_DATA: ProjectOverviewStatsPageType[] = [
    {

        id: "totalWorkflows",
        title: "Total Workflows",
        description: "Actice Workflows Available",
        icon: Waypoints,
    },
    {
        id: "activeCredentials",
        title: "Active Credentials",
        description: "Total active Credentials",
        icon: KeyRound,
    },
    {
        id: "totalExecutionsToday",
        title: "Executions Today",
        description: "Execution in last 24h",
        icon: Activity,
    },
    {
        id: "failedExecutionToday",
        title: "Failed Runs",
        description: "In the last 24 hours",
        icon: AlertTriangle,
    },
]

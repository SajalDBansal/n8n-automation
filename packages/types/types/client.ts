import { LucideIcon } from "lucide-react";
import { Edge, Node, ExecutionStatusType } from "./engine";

export type OverviewStatsPageType = {
    id: StatsName;
    title: string;
    description: string;
    icon: LucideIcon;
}

export type StatsName = "totalWorkflows" | "totalExecutionsToday" | "activeProjects" | "failedExecutionToday";

export type OverviewStatsPageDataType = Record<StatsName, number>;

export type ProjectOverviewStatsPageType = {
    id: ProjectStatsName;
    title: string;
    description: string;
    icon: LucideIcon;
}

export type ProjectStatsName = "totalWorkflows" | "totalExecutionsToday" | "activeCredentials" | "failedExecutionToday";

export type ProjectOverviewStatsPageDataType =
    { projectDetails: Partial<ProjectType> } & Record<ProjectStatsName, number>;

export type ProjectNavigatorType = {
    id: string;
    name: string;
    type: string;
    icon: {
        type: "IMAGE" | "ICON";
        value: string;
    };
    workflows: {
        name: string;
        id: string;
    }[];
}

export type ProjectType = {
    id: string;
    name: string;
    description?: string;
    type: "PERSONAL" | "TEAM",
    icon?: { type: "ICON" | "IMAGE", value: string } | null;
    userId: string;
    createdAt: string;
    updatedAt: string;
    workflows?: { id: string, name: string }[];
}

export type ProjectStoreType = {
    projects: ProjectType[] | null;
    setProjects: (projects: ProjectType[]) => void;
    updateProject: (projectId: string, updates: Partial<ProjectType>) => void;
    addProjects: (project: ProjectType) => void;
    deleteProject: (projectId: string, force: boolean) => void;
    addWorkflow: (projectId: string, workflow: { id: string, name: string }) => void;
    deleteWorkflow: (projectId: string, workflowId: string) => void;
}

export type WorkflowType = {
    id: string;
    name: string;
    description?: string;
    projectId: string;
    active: boolean;
    isArchived: boolean;
    nodes: Node[];
    edges: Edge[];
    jsonOutput?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export type WorkflowStoreType = {
    workflow: WorkflowType | null;
    selectedNodeId: string | null;
    selectedEdgeId: string | null;
    jsonOutput?: Record<string, any> | null;

    // setters
    setWorkflow: (workflow: WorkflowType) => void;
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    setSelectedNodeId: (id: string | null) => void;
    setSelectedEdgeId: (id: string | null) => void;
    setJsonOutputs: (json: Record<string, any>) => void

    // node operations
    addNode: (node: Node) => void;
    removeNode: (nodeId: string) => void;
    changeNodeProperty: (nodeId: string, key: string, value: string) => void;
    nodeParameterChangeHandler: (key: string, value: string) => void;

    // edge operations
    addEdge: (edge: Edge) => void;
    removeEdge: (edgeId: string) => void;

    // selectors / helpers
    getSelectedNode: () => Node | null;
    getSelectedEdge: () => Edge | null;
    getJsonOutputById: (nodeId: string) => any
    getInputsForNode: (nodeId: string) => Record<string, any>
}



export type UseEcexutionsOptions = {
    projectId: string;
    limit?: number;
    status?: string; //check if type can be set to ExecutionStatusType
    workflowId?: string;
    refreshInterval?: number;
}

export type ExecutionType = {
    id: string;
    workflowId: string | null;
    workflowName: string;
    status: ExecutionStatusType;
    isFinished: boolean;
    startedAt: string | null;
    stoppedAt: string | null;
    createdAt: string;
    runtimeMs: number;
    runtimeFormatted: string;
}

export type ExecutionResponseType = {
    success: boolean,
    message: string;
    executions: ExecutionType[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasMore: boolean;
    };
    filters: {
        status?: string;
        workflowId?: string;
    };
}

export type WorkflowsResponseType = {
    project: {
        id: string;
        name: string;
    }
    id: string;
    name: string;
    description: string | null;
    projectId: string;
    active: boolean;
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type CredentialsPageReturnType = {
    id: string;
    name: string;
    type: string; // avoid Prisma enum leakage
    icon: any;
    description: string | null,
    credentials: {
        id: string;
        name: string;
        type: string;
        createdAt: Date;
        updatedAt: Date;
    }[];
};
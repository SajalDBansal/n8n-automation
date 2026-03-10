import { LucideIcon } from "lucide-react";
import { Edge, Node } from "./engine";

export type OverviewStatsPageType = {
    id: StatsName;
    title: string;
    description: string;
    icon: LucideIcon;
}

export type StatsName = "totalWorkflows" | "totalExecutionsToday" | "activeProjects" | "failedExecutionToday";

export type OverviewStatsPageDataType = Record<StatsName, number>;

export type ProjectNavigatorType = {
    id: string;
    name: string;
    type: string;
    icon: {
        type: string;
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
    icon?: { type: string, value: string } | null;
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
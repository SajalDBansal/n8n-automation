import { WorkflowType } from "./client";
import { NodeType, NodeName } from "./node";
import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";

export type ExecutionStatusType = "CANCELLED" | "CRASHED" | "ERROR" | "STARTING" | "SUCCESS" | "RUNNING";

export type Node = {
    id: string;
    name: NodeName;
    type: NodeType;
    position: { x: number, y: number }
    parameters: Record<string, any>;
    data: Record<string, any>;
    description?: string;
    credentialId?: string
}

export type NodeTypeFromDB = {
    id: string;
    name: NodeName;
    type: NodeType;
    positionX: number;
    positionY: number;
    parameters: Record<string, any>;
    data: Record<string, any>;
    credentialId?: string
}

export type Edge = {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
}

export interface ExecutionJob {
    workflowId: string;
    executionId: string;
    projectId: string;
}

export type ExecutionRunTimeInput = {
    workflowId: string;
    executionId: string;
    projectId: string;
    nodes: Node[];
    edges: Edge[]
}

export type ExecutionEventPublisher = {
    publish(payload: Record<string, unknown>): Promise<void>;
}

export interface ExecutionEngine {
    execute(job: ExecutionJob): Promise<void>
}

export type NodeOutput = Record<string, { nodeName: string, json: any }>;

export enum NodeStatus {
    success = "SUCCESS",
    failed = "FAILED",
    executing = "EXECUTING",
    idle = "IDLE",
}

export type ExecutionStatusDataType = {
    status: ExecutionStatusType,
    isFinished: boolean,
    startedAt?: Date,
    stoppedAt?: Date
}

export type NodeOutputDataType = {
    [nodeId: string]: {
        json: Record<string, unknown>;
    }
}

export type NodeExecutionBasePayload = {
    nodeData?: {
        nodeId: string;
        nodeName: NodeName;
        nodeStatus: NodeStatus;
    }
    executionId: string | null;
    workflowId: string | null;
    projectId: string | null;
}

export type PublishPayloadDataType = {
    nodeData?: {
        nodeId: string;
        nodeName: NodeName;
        nodeStatus: NodeStatus;
    };
    executionId: string | null;
    workflowId: string | null;
    projectId: string | null;
    status: string;
    message: string;
    response?: Record<string, unknown>;
    json?: Record<string, unknown>;
    error?: string

}

// export type WorkflowNode = RFNode<{
//     engine: Node; // 👈 your full node lives here
//     executionStatus?: string;
//     onDelete?: (id: string) => void;
// }>;

export type EditorStoreType = {
    nodes: Node[];
    edges: RFEdge[];
    workflow: WorkflowType | null;
    isLoading: boolean;
    error: string | null;

    // setters
    setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
    setEdges: (edges: RFEdge[] | ((prev: RFEdge[]) => RFEdge[])) => void;
    setWorkflowInEditor: (workflow: WorkflowType) => void;

    // actions
    onNodesChange: (changes: any) => void;
    onEdgesChange: (changes: any) => void;
    onConnect: (params: any) => void;
    saveWorkflow: (projectId: string, workflowId: string,) => Promise<any>;

    updateWorkflowData: (updates: Partial<WorkflowType>) => void;
}
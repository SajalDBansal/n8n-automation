import { NodeType, NodeName } from "./node";

export type ExecutionStatusType = "CANCELLED" | "CRASHED" | "ERROR" | "STARTING" | "SUCCESS" | "RUNNING";

export type Node = {
    id: string;
    name: NodeName;
    type: NodeType;
    postionX: number;
    positionY: number;
    parameters: Record<string, any>;
    data?: Record<string, any>;
    credentialId?: string
}

export type Edge = {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
}

export type ExecutionJob = {
    workflowId: string;
    executionId: string;
}

export type ExecutionRunTimeInput = {
    workflowId: string;
    executionId: string;
    projectId: string;
    nodes: Node[];
    Edges: Edge[]
}

export type ExecutionEventPublisher = {
    publish(payload: Record<string, unknown>): Promise<void>;
}

export type ExecutionEngine = {
    execute(job: ExecutionJob): Promise<void>
}

export type NodeOutput = Record<string, { nodeName: string, json: any }>;

export enum NodeStatus {
    success = "SUCCESS",
    failed = "FAILED",
    executing = "EXECUTING",
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
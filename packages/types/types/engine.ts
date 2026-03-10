export type Nodename = "MANUAL_TRIGGER" | "WEBHOOK" | "AGENT" | "TELEGRAM" | "RESEND";

export type Node = {
    id: string;
    name: Nodename;
    type: "WEBHOOK" | "TRIGGER" | "AGENT" | "MODEL";
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
    status: "CANCELLED" | "CRASHED" | "ERROR" | "STARTING" | "SUCCESS" | "RUNNING",
    isFinished: boolean,
    startedAt?: Date,
    stoppedAt?: Date
}

export type NodeExecutionBasePayload = {
    nodeId: string;
    nodeName: Nodename;
    executionId: string | null;
    workflowId: string | null;
}
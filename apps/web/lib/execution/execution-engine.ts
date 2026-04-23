import prisma from "@workspace/database";
import { Edge, ExecutionJob, Node, type ExecutionEngine } from "@workspace/types"
import { getRedisClient } from "../redis-manager";
import { runWorkflowExecution } from "@workspace/execution-core";
import { publishExecutionEvent } from "./evevt-emitter";

type ExecutionPayload = {
    nodes: Node[],
    edges: Edge[],
}

const isExecutionPayload = (value: unknown): value is ExecutionPayload => {
    if (!value || typeof value != "object") return false;
    const payload = value as ExecutionPayload;
    return Array.isArray(payload.nodes) && Array.isArray(payload.edges);
}

const getExecutionPayload = async (executionId: string) => {
    const execution = await prisma.execution.findFirst({
        where: { id: executionId },
        select: {
            data: true
        }
    })

    if (!execution || !isExecutionPayload(execution.data)) {
        throw new Error("Execution not found or missing workflow graph data");
    }

    return execution.data;
}

export class QueueExecutionEngine implements ExecutionEngine {
    async execute(job: ExecutionJob): Promise<void> {
        const redisClient = await getRedisClient();
        await redisClient.lPush(`execute-workflow`, JSON.stringify(job));
    }
}

export class InMemoryExecutionEngine implements ExecutionEngine {
    async execute(job: ExecutionJob): Promise<void> {
        const executionPayload = await getExecutionPayload(job.executionId);
        void runWorkflowExecution({
            workflowId: job.workflowId,
            executionId: job.executionId,
            projectId: job.projectId,
            nodes: executionPayload.nodes,
            edges: executionPayload.edges,
        }, {
            publish: async (payload) => {
                await publishExecutionEvent(job.executionId, payload);
            }
        }).catch((error) => {
            console.error(`Failed to run in-memory workflow execution ${job.executionId}:`, error);
        })
    }
}

export const isWorkerModeEnabled = () => {
    const raw = process.env.ENABLE_WORKERS?.trim().toLowerCase();
    if (!raw) return false;
    return raw === "true" || raw === "1" || raw === "yes" || raw === "'on";
}

export const getExecutionEngine = (): ExecutionEngine => {
    if (isWorkerModeEnabled()) {
        return new QueueExecutionEngine();
    }
    return new InMemoryExecutionEngine();
}
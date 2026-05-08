import prisma from "@workspace/database";
import { Edge, ExecutionJob, Node, WebhookTriggerPayload, type ExecutionEngine } from "@workspace/types"
import { runWorkflowExecution } from "@workspace/execution-core";
import { publishExecutionEvent } from "./evevt-emitter";
import config from "@/utils/config";

type ExecutionPayload = {
    nodes: Node[],
    edges: Edge[],
    triggerPayload?: WebhookTriggerPayload | null,
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

// TODO: make the flow such that the request from here goes to redis took by webhook
export class QueueExecutionEngine implements ExecutionEngine {
    async execute(job: ExecutionJob): Promise<void> {
        // There is no standalone worker process anywhere in this repo that
        // ever reads from the `execute-workflow` queue — pushing here and
        // waiting for a result would hang the request indefinitely. Fail
        // fast and clearly instead, until a real worker exists.
        throw new Error(
            "Worker mode (ENABLE_WORKERS) is enabled, but no worker process consumes the execution queue yet. " +
            "Unset ENABLE_WORKERS to run executions in-process, or implement the standalone worker before enabling this."
        );
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
            triggerPayload: executionPayload.triggerPayload,
        }, {
            publish: async (payload) => {
                await publishExecutionEvent(job.executionId, payload);
            }
        }).catch((error) => {
            console.error(`Failed to run in-memory workflow execution ${job.executionId}:`, error);
        })
    }
}

export const isWorkerModeEnabled = () => config.ENABLE_WORKERS;

export const getExecutionEngine = (): ExecutionEngine => {
    if (isWorkerModeEnabled()) {
        return new QueueExecutionEngine();
    }
    return new InMemoryExecutionEngine();
}
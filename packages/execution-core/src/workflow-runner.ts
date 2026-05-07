import type { Edge, ExecutionEventPublisher, ExecutionRunTimeInput, ExecutionStatusType, Node, NodeExecutionBasePayload, PublishPayloadDataType, WebhookTriggerPayload } from "@workspace/types";
import { NodeStatus } from "@workspace/types";
import { NodeOutput } from "./node-output";
import { updateExecutionStatusInDB } from "./db-helper";
import { constructErrorMessage } from "./error-provider";
import { ExpressionResolver, UnresolvedExpressionError } from "./expression-resolver";
import { predefinedNodesStructure } from "./execute-provider";
import pLimit from "p-limit";

class NodeExecutionError extends Error {
    type: "VALIDATION" | "EXECUTION" | "SYSTEM";
    isRetryable: boolean;
    shouldCancelFlow: boolean;

    constructor({
        type,
        message,
        isRetryable = false,
        shouldCancelFlow = false
    }: {
        type: "VALIDATION" | "EXECUTION" | "SYSTEM";
        message: string;
        isRetryable?: boolean;
        shouldCancelFlow?: boolean;
    }) {
        super(message);
        this.type = type;
        this.isRetryable = isRetryable;
        this.shouldCancelFlow = shouldCancelFlow;
    }
}


export class WorkFlowRunner {
    workflowId: string | null = null;
    executionId: string | null = null;
    projectId: string | null = null;
    nodes: Node[] = [];
    edges: Edge[] = [];
    nodeOutputs: NodeOutput;
    private publisher: ExecutionEventPublisher;
    private triggerPayload: WebhookTriggerPayload | null = null;

    // Scoped per run instead of module scope — otherwise every concurrent
    // execution across every user shared the same 5 global slots.
    private limit = pLimit(5);

    // Graph for execution traversal Kahns algorithim
    private inDegree = new Map<string, number>();
    private adjacentList = new Map<string, string[]>();
    private blockedNodes = new Set<string>();

    // Snapshot of each node's parent count, taken once in buildGraph() and
    // never mutated afterward — lets settleNode() tell "one of several
    // parents failed" apart from "every parent failed", so a diamond shape
    // only blocks the merge node when *all* branches into it are dead.
    private totalParentCount = new Map<string, number>();
    private blockedParentCount = new Map<string, number>();
    private lastUpstreamFailure = new Map<string, { message: string; type: "VALIDATION" | "EXECUTION" | "SYSTEM" }>();

    // A node that fails on its own is *not* necessarily added to
    // blockedNodes (that set is for nodes cascade-blocked because every
    // parent failed) — so blockedNodes.size alone can't detect "node B
    // failed but the run otherwise completed". This does.
    private hasNodeFailure = false;

    // for fast node traversal
    private nodeMap = new Map<string, Node>()
    private childrenMap = new Map<string, Edge[]>();
    private basePayload: NodeExecutionBasePayload = {
        executionId: "",
        workflowId: "",
        projectId: "",
    }

    constructor(input: ExecutionRunTimeInput, publisher: ExecutionEventPublisher) {
        this.workflowId = input.workflowId;
        this.executionId = input.executionId;
        this.projectId = input.projectId;
        this.nodes = input.nodes;
        this.edges = input.edges;
        this.triggerPayload = input.triggerPayload ?? null;
        this.publisher = publisher;
        this.nodeOutputs = new NodeOutput();
        this.basePayload = {
            executionId: input.executionId,
            workflowId: input.workflowId,
            projectId: input.projectId,
        }

        this.nodeMap = new Map(this.nodes.map(n => [n.id, n]));
        for (const edge of this.edges) {
            if (!this.childrenMap.has(edge.source)) {
                this.childrenMap.set(edge.source, []);
            }
            this.childrenMap.get(edge.source)!.push(edge);
        }
    }

    private async publish(payload: PublishPayloadDataType) {
        await this.publisher.publish(payload);
    }

    private normalizeError(error: any): NodeExecutionError {
        if (error instanceof NodeExecutionError) return error;

        const message = constructErrorMessage(error);

        return new NodeExecutionError({
            type: "EXECUTION",
            message,
            isRetryable: true
        });
    }

    private buildGraph() {
        // get the id of all the connect nodes
        const connectedNodesId = new Set<string>();

        for (const edge of this.edges) {
            connectedNodesId.add(edge.source);
            connectedNodesId.add(edge.target);
        }

        const disconnectedNodes = this.nodes.filter(node => !connectedNodesId.has(node.id));

        if (disconnectedNodes.length > 0) {
            // An isolated TRIGGER/WEBHOOK with no edges is a legitimate
            // single-node workflow — it's still a valid entry point, it just
            // has nothing downstream. Anything else with zero edges can
            // never be reached by anything, so skip it instead of failing
            // the entire run over one stray node.
            const orphanedNodes = disconnectedNodes.filter(
                (node) => node.type !== "TRIGGER" && node.type !== "WEBHOOK"
            );

            if (orphanedNodes.length > 0) {
                console.warn("Skipping disconnected nodes with no path to a trigger: ", orphanedNodes.map(n => n.name));
                const orphanedIds = new Set(orphanedNodes.map(n => n.id));
                this.nodes = this.nodes.filter(node => !orphanedIds.has(node.id));
                this.nodeMap = new Map(this.nodes.map(n => [n.id, n]));
            }
        }

        for (const node of this.nodes) {
            this.inDegree.set(node.id, 0);
            this.adjacentList.set(node.id, []);
        }

        for (const edge of this.edges) {
            const { source, target } = edge;

            if (source === target) {
                throw new NodeExecutionError({
                    type: "VALIDATION",
                    message: `Self-loop detected at node: ${source}`,
                    shouldCancelFlow: true
                });
            }

            if (!this.nodeMap.has(source) || !this.nodeMap.has(target)) {
                throw new NodeExecutionError({
                    type: "SYSTEM",
                    message: `Invalid edge: ${edge.source} -> ${edge.target}`,
                    shouldCancelFlow: true
                });
            }

            this.adjacentList.get(source)?.push(target);
            this.inDegree.set(target, (this.inDegree.get(target) || 0) + 1);
        }

        this.totalParentCount = new Map(this.inDegree);
    }

    private validateGraph() {
        const startNodes = this.nodes.filter((node) => (this.inDegree.get(node.id) || 0) === 0);

        if (startNodes.length === 0) {
            throw new NodeExecutionError({
                type: "VALIDATION",
                message: "No starting nodes found (possible cycle or invalid graph)",
                shouldCancelFlow: true
            });
        }

        const invalidStartNodes = startNodes.filter(
            (node) => node.type !== "TRIGGER" && node.type !== "WEBHOOK")

        if (invalidStartNodes.length > 0) {
            throw new NodeExecutionError({
                type: "VALIDATION",
                message: `Invalid workflow: Non-trigger nodes as entry (${invalidStartNodes.map(n => n.name).join(", ")})`,
                shouldCancelFlow: true
            });
        }

        const tempInDegree = new Map(this.inDegree);
        const queue = [...startNodes.map(n => n.id)];
        let processedCount = 0;

        while (queue.length > 0) {
            const nodeId = queue.shift()!;
            processedCount++;
            for (const childNodeId of this.adjacentList.get(nodeId) || []) {
                const deg = (tempInDegree.get(childNodeId) || 0) - 1;
                tempInDegree.set(childNodeId, deg);
                if (deg === 0) queue.push(childNodeId);
            }
        }

        if (processedCount !== this.inDegree.size) {
            const cycle = this.findCycle();
            throw new NodeExecutionError({
                type: "VALIDATION",
                message: cycle ? `Cycle detected: ${cycle.join(" → ")}` : "Cycle detected",
                shouldCancelFlow: true
            });
        }
    }

    private findCycle() {
        const visited = new Set<string>();
        const stack = new Set<string>();
        const parent = new Map<string, string | null>();

        const dfs = (nodeId: string): string[] | null => {
            visited.add(nodeId);
            stack.add(nodeId);

            for (const neighborId of this.adjacentList.get(nodeId) || []) {
                // case 1: is node is unvisited
                if (!visited.has(neighborId)) {
                    parent.set(neighborId, nodeId);
                    const cycleFromNeighbor = dfs(neighborId);
                    if (cycleFromNeighbor) return cycleFromNeighbor;
                }
                // get cycle if found
                else if (stack.has(neighborId)) {
                    // recounstruct cycle path
                    const cycle: string[] = [neighborId];
                    let currentNodeID: string | null = nodeId;

                    while (currentNodeID && currentNodeID !== neighborId) {
                        cycle.push(currentNodeID);
                        currentNodeID = parent.get(currentNodeID) || null;
                    }

                    cycle.push(neighborId);
                    cycle.reverse();

                    return cycle;
                }
            }

            stack.delete(nodeId);
            return null;
        }

        for (const node of this.nodes) {
            if (!visited.has(node.id)) {
                parent.set(node.id, null);
                const cycle = dfs(node.id);
                if (cycle) return cycle;
            }
        }

        return null;
    }

    async run() {
        await updateExecutionStatusInDB(this.executionId!, "STARTING");
        await this.publish({
            ...this.basePayload,
            status: "STARTING",
            message: "Workflow Execution Started"
        })

        try {
            this.buildGraph();
            this.validateGraph();

            await updateExecutionStatusInDB(this.executionId!, "RUNNING");
            await this.publish({
                ...this.basePayload,
                status: "RUNNING",
                json: this.nodeOutputs.json,
                message: "Workflow Execution Running"
            })

            const queue: string[] = [];
            for (const [nodeId, degree] of this.inDegree.entries()) {
                if (degree === 0) queue.push(nodeId);
            }

            await this.processExecutionQueue(queue);

            // A node can fail (or be blocked because every path into it
            // failed) without ever throwing shouldCancelFlow — the run
            // itself must reflect that instead of reporting SUCCESS just
            // because nothing reached the top-level catch.
            if (this.hasNodeFailure || this.blockedNodes.size > 0) {
                await updateExecutionStatusInDB(this.executionId!, "ERROR", true);
                await this.publish({
                    ...this.basePayload,
                    status: "ERROR",
                    json: this.nodeOutputs.json,
                    message: "Workflow finished with one or more nodes skipped due to upstream failures"
                });
                return;
            }

            await updateExecutionStatusInDB(this.executionId!, "SUCCESS", true);
            await this.publish({
                ...this.basePayload,
                status: "FINISHED",
                json: this.nodeOutputs.json,
                message: "Workflow Execution Finished Successfully"
            })

        } catch (err) {
            const error = this.normalizeError(err);

            let status: "CRASHED" | "ERROR" | "CANCELLED" = "ERROR";

            if (error.type === "SYSTEM") status = "CRASHED";
            if (error.shouldCancelFlow) status = "CANCELLED";

            // execution-core has no dependency on apps/web (or its logger) by
            // design — it stays framework-agnostic. Structured JSON straight
            // to console covers this boundary on its own.
            console.error(JSON.stringify({
                level: "error",
                timestamp: new Date().toISOString(),
                message: "Workflow execution crashed",
                context: { executionId: this.executionId, status, errorType: error.type },
                error: err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err
            }));

            await updateExecutionStatusInDB(this.executionId!, status, true);

            await this.publish({
                ...this.basePayload,
                status,
                json: this.nodeOutputs.json,
                message: error.message
            });
        }

    }

    // Runs one node to completion and reports the outcome instead of
    // throwing — a batch of these is awaited together in
    // processExecutionQueue so a cancelling node can't cut off its
    // still-running siblings before they get their own terminal status.
    private async runNodeInBatch(nodeId: string): Promise<{
        nodeId: string;
        success: boolean;
        errorMessage?: string;
        errorType?: "VALIDATION" | "EXECUTION" | "SYSTEM";
        shouldCancelFlow?: boolean;
    }> {
        const node = this.nodeMap.get(nodeId);
        if (!node) {
            return {
                nodeId,
                success: false,
                errorMessage: `Node not found: ${nodeId}`,
                errorType: "SYSTEM",
                shouldCancelFlow: true
            };
        }

        try {
            await this.executeNodeWithRetries(node);
            return { nodeId, success: true };
        } catch (err) {
            const error = this.normalizeError(err);

            return {
                nodeId,
                success: false,
                errorMessage: error.message,
                errorType: error.type,
                shouldCancelFlow: error.shouldCancelFlow
            };
        }
    }

    async processExecutionQueue(queue: string[]) {
        while (queue.length > 0) {
            const currentBatchNodes = [...queue];
            queue.length = 0;

            const executableNodes = currentBatchNodes.filter(nodeId => !this.blockedNodes.has(nodeId));

            if (executableNodes.length === 0) {
                console.warn("No executable nodes left — possible full branch failure");
                break;
            };

            // Every node in this batch is run to completion (success or
            // failure) before any cancellation decision is made below — a
            // node that ends up shouldCancelFlow can no longer cut off its
            // still-running siblings mid-batch and leave them with no
            // terminal status published.
            const result = await Promise.all(
                executableNodes.map(nodeId => this.limit(() => this.runNodeInBatch(nodeId)))
            )

            const nextNodes: string[] = [];
            let cancellation: { message: string; type: "VALIDATION" | "EXECUTION" | "SYSTEM" } | null = null;

            for (const r of result) {
                if (r.success) {
                    nextNodes.push(...await this.settleNode(r.nodeId, { success: true }));
                    continue;
                }

                this.hasNodeFailure = true;

                if (r.shouldCancelFlow && !cancellation) {
                    cancellation = { message: r.errorMessage!, type: r.errorType! };
                }

                nextNodes.push(...await this.settleNode(r.nodeId, {
                    success: false,
                    errorMessage: r.errorMessage!,
                    errorType: r.errorType!
                }));
            }

            if (cancellation) {
                throw new NodeExecutionError({
                    type: cancellation.type,
                    message: cancellation.message,
                    shouldCancelFlow: true
                });
            }

            queue.push(...nextNodes);
        }
    }

    private async publishNodeFailure(nodeId: string, error: string, type: "VALIDATION" | "EXECUTION" | "SYSTEM" = "EXECUTION") {
        const node = this.nodeMap.get(nodeId);
        if (!node) return;

        const status: ExecutionStatusType =
            type === "VALIDATION" ? "CANCELLED" :
                type === "SYSTEM" ? "CRASHED" :
                    "ERROR";

        await this.publish({
            ...this.basePayload,
            nodeData: {
                nodeId: node.id,
                nodeName: node.name,
                nodeStatus: NodeStatus.failed
            },
            status,
            message: error,
            json: this.nodeOutputs.json
        });
    }

    // Called once per node when it finishes — on success, on hard failure,
    // or when cascade-blocked by an upstream failure. Decrements each
    // child's in-degree exactly once and only blocks a child once *every*
    // one of its parents has failed or been blocked — a diamond's still-live
    // branch keeps the merge node eligible to run instead of being blocked
    // the moment any single parent fails.
    private async settleNode(
        nodeId: string,
        outcome: { success: true } | { success: false; errorMessage: string; errorType: "VALIDATION" | "EXECUTION" | "SYSTEM" }
    ): Promise<string[]> {
        const children = this.adjacentList.get(nodeId) || [];
        const ready: string[] = [];

        for (const childId of children) {
            if (this.blockedNodes.has(childId)) continue;

            if (!outcome.success) {
                this.blockedParentCount.set(childId, (this.blockedParentCount.get(childId) || 0) + 1);
                this.lastUpstreamFailure.set(childId, { message: outcome.errorMessage, type: outcome.errorType });
            }

            const newDegree = (this.inDegree.get(childId) || 0) - 1;
            this.inDegree.set(childId, newDegree);

            if (newDegree <= 0) {
                const totalParents = this.totalParentCount.get(childId) || 0;
                const blockedParents = this.blockedParentCount.get(childId) || 0;

                if (totalParents > 0 && blockedParents >= totalParents) {
                    const failure = this.lastUpstreamFailure.get(childId);
                    await this.markNodeBlocked(childId, failure?.message ?? "Upstream failure", failure?.type ?? "EXECUTION", ready);
                } else {
                    ready.push(childId);
                }
            }
        }

        return ready;
    }

    private async markNodeBlocked(
        nodeId: string,
        error: string,
        errorType: "VALIDATION" | "EXECUTION" | "SYSTEM",
        readyAcc: string[]
    ) {
        this.blockedNodes.add(nodeId);

        const nodeData = this.nodeMap.get(nodeId);
        if (nodeData) {
            const status: ExecutionStatusType = errorType === "VALIDATION" ? "CANCELLED" : errorType === "EXECUTION" ? "ERROR" : "CRASHED";

            await this.publish({
                ...this.basePayload,
                nodeData: {
                    nodeId: nodeData.id,
                    nodeName: nodeData.name,
                    nodeStatus: NodeStatus.skipped
                },
                status,
                json: this.nodeOutputs.json,
                message: `${errorType}: Skipped due to upstream failure: ${error}`
            });
        }

        const downstreamReady = await this.settleNode(nodeId, { success: false, errorMessage: error, errorType });
        readyAcc.push(...downstreamReady);
    }

    async executeNodeWithRetries(node: Node) {
        const maxRetries = 3;
        let attempt = 0;

        const commonPayload: NodeExecutionBasePayload = {
            nodeData: {
                nodeId: node.id,
                nodeName: node.name,
                nodeStatus: NodeStatus.executing
            },
            ...this.basePayload
        };

        while (attempt < maxRetries) {

            try {

                await this.publish({
                    ...commonPayload,
                    status: "RUNNING",
                    message: `Executing node ${node.name}`
                });

                await this.executeNode(node);

                await this.publish({
                    ...commonPayload,
                    status: "SUCCESS",
                    message: `Node ${node.name} executed successfully`,
                    nodeData: {
                        ...commonPayload.nodeData!,
                        nodeStatus: NodeStatus.success
                    },
                    json: this.nodeOutputs.json
                });

                return;
            } catch (err: any) {
                const error = this.normalizeError(err);

                if (error.type === "VALIDATION") {

                    await this.publishNodeFailure(node.id, error.message, error.type);

                    throw error;
                }

                if (!error.isRetryable) {
                    await this.publish({
                        ...commonPayload,
                        status: error.type === "SYSTEM" ? "CRASHED" : "ERROR",
                        message: error.message,
                        nodeData: {
                            ...commonPayload.nodeData!,
                            nodeStatus: NodeStatus.failed
                        },
                        json: this.nodeOutputs.json
                    });

                    throw error;
                }

                attempt++;

                if (attempt >= maxRetries) {
                    await this.publish({
                        ...commonPayload,
                        status: "ERROR",
                        message: error.message,
                        nodeData: {
                            ...commonPayload.nodeData!,
                            nodeStatus: NodeStatus.failed
                        },
                        json: this.nodeOutputs.json
                    });

                    throw error;
                }

                const delay = 500 * Math.pow(2, attempt);
                await new Promise(res => setTimeout(res, delay));
            }
        }
    }

    async executeNode(currentNode: Node | null) {
        if (!currentNode) return;

        // Chat-model nodes only execute indirectly, via the Agent node that
        // consumes them (see getConnectModel below) — skip them here.
        if (currentNode.type === "CHAT_MODEL") {
            await this.publish({
                ...this.basePayload,
                status: "RUNNING",
                message: "Model Node executed via Agent",
                nodeData: {
                    nodeId: currentNode.id,
                    nodeName: currentNode.name,
                    nodeStatus: NodeStatus.skipped
                }
            });
            return;
        }

        // No status publish on failure here — a failure at this point may
        // still be retried by executeNodeWithRetries (the caller), which is
        // the single place that owns publishing this node's actual terminal
        // status once the outcome is final. Publishing here too was firing
        // a FAILED event on every retryable attempt, even ones that went on
        // to succeed.
        await this.executeNodeByType(currentNode);
    }

    async executeNodeByType(currentNode: Node) {
        const resolvedParameters = this.resolveNodeParameters(currentNode);

        try {
            switch (currentNode.name) {
                case "manualTrigger":
                    this.executeManualTrigger(currentNode);
                    break;
                case "webhook":
                    this.executeWebhookTrigger(currentNode);
                    break;
                case "agent":
                    await this.executeAgentNode(currentNode, resolvedParameters);
                    break;
                case "telegram":
                    await this.executeTelegramNode(currentNode, resolvedParameters);
                    break;
                case "resend":
                    await this.executeResendNode(currentNode, resolvedParameters);
                    break;
                default:
                    throw new Error(`Unknown or Unsupported type: ${currentNode.name}`)
            }
        } catch (err) {
            const error = this.normalizeError(err);

            throw new NodeExecutionError(error);
        }
    }

    // Resolves {{ expressions }} in a node's parameters against the outputs
    // of nodes that already ran. Wraps the resolver's own error into a
    // per-node VALIDATION failure (fails only this node's branch) rather
    // than letting it propagate as a generic error.
    private resolveNodeParameters(node: Node): Record<string, unknown> {
        const resolver = new ExpressionResolver(this.nodeOutputs.getOutputForResolver());

        try {
            return resolver.resolveParameters(node.parameters);
        } catch (error) {
            if (error instanceof UnresolvedExpressionError) {
                throw new NodeExecutionError({
                    type: "VALIDATION",
                    message: error.message,
                });
            }
            throw error;
        }
    }

    private executeManualTrigger(node: Node) {
        this.nodeOutputs.addOutput({
            nodeId: node.id,
            nodeName: node.name,
            json: node.parameters
        });
    }

    // Uses the real triggering request when available; falls back to the
    // node's static config when run manually (e.g. the editor's Execute
    // button), so testing still produces some output instead of nothing.
    private executeWebhookTrigger(node: Node) {
        this.nodeOutputs.addOutput({
            nodeId: node.id,
            nodeName: node.name,
            json: this.triggerPayload ?? node.parameters,
        });
    }

    private async executeAgentNode(node: Node, resolvedParameters: Record<string, unknown>) {
        const agent = predefinedNodesStructure.agent;

        if (!agent || !agent.type) {
            throw new NodeExecutionError({
                type: "SYSTEM",
                message: "Agent node type not configured"
            });
        }

        const suppliedModelResult = await this.getConnectModel(node);

        if (!suppliedModelResult.success) {
            throw new NodeExecutionError({
                type: "VALIDATION",
                message: suppliedModelResult.error || "Failed to connect to model"
            });
        }

        if (!agent.type.execute) {
            // TODO(bug): plain Error here (unlike the sibling checks above
            // and the equivalent checks in Telegram/Resend below) gets
            // normalized to a retryable EXECUTION error, so this pointlessly
            // retries 3 times instead of failing immediately like the other
            // "not configured" cases. Not changed here to avoid altering
            // retry behavior in a readability pass.
            throw new Error("Agent node type does not have execute method");
        }

        const agentResponse = await agent.type.execute({
            parameters: resolvedParameters,
            model: suppliedModelResult.model
        });

        if (!agentResponse || !agentResponse.success) {
            throw new NodeExecutionError({
                type: "EXECUTION",
                message: agentResponse.error || "Agent execution failed",
                isRetryable: true
            });
        }

        this.nodeOutputs.addOutput({
            nodeId: node.id,
            nodeName: node.name,
            json: { output: agentResponse.data.output },
        });
    }

    private async executeTelegramNode(node: Node, resolvedParameters: Record<string, unknown>) {
        const telegram = predefinedNodesStructure.telegram;

        if (!telegram || !telegram.type) {
            throw new NodeExecutionError({
                type: "SYSTEM",
                message: "Telegram node type does not have execute method"
            });
        }

        if (!resolvedParameters || !resolvedParameters.chatId || !resolvedParameters.text) {
            throw new NodeExecutionError({
                type: "VALIDATION",
                message: "Telegram node requires 'chatId' and 'text' parameters",
                isRetryable: false
            });
        }

        if (!telegram.type.execute) {
            throw new NodeExecutionError({
                type: "SYSTEM",
                message: "Telegram node does not implement execute"
            });
        }

        const telegramResponse = await telegram.type.execute({
            parameters: resolvedParameters,
            projectId: this.projectId!,
            credentialId: node.credentialId!
        });

        if (!telegramResponse || !telegramResponse.success) {
            throw new NodeExecutionError({
                type: "EXECUTION",
                message: telegramResponse.error || "Telegram execution failed",
                isRetryable: true
            });
        }

        this.nodeOutputs.addOutput({
            nodeId: node.id,
            nodeName: node.name,
            json: telegramResponse.data,
        });
    }

    private async executeResendNode(node: Node, resolvedParameters: Record<string, unknown>) {
        const resend = predefinedNodesStructure.resend;

        if (!resend || !resend.type) {
            // TODO(bug): see the equivalent note in executeAgentNode — plain
            // Error here makes this pointlessly retry 3 times instead of
            // failing immediately.
            throw new Error("Resend node type not found or not properly configured");
        }

        if (!resend.type.execute) {
            throw new Error("Resend node type does not have execute method");
        }

        const resendResponse = await resend.type.execute({
            parameters: resolvedParameters,
            projectId: this.projectId!,
            credentialId: node.credentialId!
        });

        if (!resendResponse || !resendResponse.success) {
            throw new NodeExecutionError({
                type: "EXECUTION",
                message: resendResponse.error || "Resend node execution failed",
                isRetryable: true
            });
        }

        this.nodeOutputs.addOutput({
            nodeId: node.id,
            nodeName: node.name,
            json: resendResponse.data,
        });
    }

    getConnectedNode(currentNode: Node) {
        const currentNodeId = currentNode.id;
        const targetNodeId = this.edges.find(
            (edge) => edge.source === currentNodeId
        )?.target;
        const nextNode = this.nodes.find((node) => node.id === targetNodeId);
        return nextNode || null;
    }

    getConnectedChildNodes(
        parentNode: Node
    ): { node: Node; handleType: string | null }[] {
        const parentNodeId = parentNode.id;
        const childEdges = this.edges.filter((edge) => edge.source === parentNodeId);

        return childEdges
            .map((edge) => {
                const childNode = this.nodes.find((node) => node.id === edge.target);
                return childNode
                    ? { node: childNode, handleType: edge.sourceHandle || null }
                    : null;
            })
            .filter(
                (child): child is { node: Node; handleType: string | null } => !!child
            );
    }

    // Resolves the single Chat Model node connected to an Agent node, then
    // asks it to supply a ready-to-use model instance. Fails if zero, or
    // more than one, Chat Model is connected — an Agent needs exactly one.
    async getConnectModel(agentNode: Node) {
        const childNodes = this.getConnectedChildNodes(agentNode);
        const modelNodes = childNodes.filter((child) =>
            child.node.type === "CHAT_MODEL" || child.handleType === "chat-model");

        if (modelNodes.length === 0) {
            throw new NodeExecutionError({
                type: "VALIDATION",
                message: "AI Agent requires exactly one Chat Model node"
            });
        }

        if (modelNodes.length > 1) {
            return {
                success: false,
                model: null,
                error: "Problem in node 'AI Agent'\nOnly one Chat Model sub-node can be connected and enabled",
            }
        }

        const modelChild = modelNodes[0];
        if (!modelChild?.node) {
            return {
                success: false,
                model: null,
                error: "Problem in node 'AI Agent'\nA Chat Model sub- node must be connected and enabled",
            }
        }

        const modelNode = modelChild.node;
        const modelName = modelNode.name;

        const lmChatModel = predefinedNodesStructure[modelName as keyof typeof predefinedNodesStructure] as any;

        if (!lmChatModel) {
            return {
                success: false,
                model: null,
                error: `Problem in node '${agentNode.name}'\n${modelName} is not a valid Chat Model node`,
            }
        }


        if (!lmChatModel.type.supplyData) {
            return {
                success: false,
                model: null,
                error: `Problem in node '${agentNode.name}'\n${modelName} is not a valid Chat Model node`,
            }
        }

        const modelSupplyResult = await lmChatModel.type.supplyData({
            parameters: modelNode.parameters,
            credentialId: modelNode.credentialId!,
            projectId: this.projectId!
        })

        if (modelSupplyResult.success) {
            return {
                success: true,
                model: modelSupplyResult.model,
                modeNodeId: modelNode.id
            }
        }

        return {
            success: false,
            model: null,
            error: `Model ${modelNode.name} failed to supply : ${modelSupplyResult.error}`,
        };
    }

}

export const runWorkflowExecution = async (
    input: ExecutionRunTimeInput,
    publisher: ExecutionEventPublisher
) => {
    const runner = new WorkFlowRunner(input, publisher);
    await runner.run();
}
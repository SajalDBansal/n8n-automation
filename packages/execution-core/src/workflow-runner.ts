import type { Edge, ExecutionEventPublisher, ExecutionRunTimeInput, ExecutionStatusType, Node, NodeExecutionBasePayload, PublishPayloadDataType } from "@workspace/types";
import { NodeStatus } from "@workspace/types";
import { NodeOutput } from "./node-output";
import { updateExecutionStatusInDB } from "./db-helper";
import { constructErrorMessage } from "./error-provider";
import { ExpressionResolver } from "./expression-resolver";
import { predefinedNodesStructure } from "./execute-provider";
import pLimit from "p-limit";

const limit = pLimit(5);

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


// have to add system that checks if the branch fails let the other branchs complete before sending fail publish
// check for resolver function when the fields have data of only parameters it display null for child nodes

export class WorkFlowRunner {
    workflowId: string | null = null;
    executionId: string | null = null;
    projectId: string | null = null;
    nodes: Node[] = [];
    edges: Edge[] = [];
    nodeOutputs: NodeOutput;
    private publisher: ExecutionEventPublisher;

    // Graph for execution traversal Kahns algorithim
    private inDegree = new Map<string, number>();
    private adjacentList = new Map<string, string[]>();
    private blockedNodes = new Set<string>();

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
            console.warn("Disconnected nodes: ", disconnectedNodes);
            throw new NodeExecutionError({
                type: "VALIDATION",
                message: `Disconnected nodes are not allowed: ${disconnectedNodes.map(n => n.name).join(", ")}`,
                shouldCancelFlow: true
            });
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
                    const cycyle = dfs(neighborId);
                    if (cycyle) return cycyle;
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

            await updateExecutionStatusInDB(this.executionId!, status, true);

            await this.publish({
                ...this.basePayload,
                status,
                json: this.nodeOutputs.json,
                message: error.message
            });
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

            const result = await Promise.all(
                executableNodes.map(nodeId =>
                    limit(async () => {
                        const node = this.nodeMap.get(nodeId);
                        if (!node) {
                            throw new NodeExecutionError({
                                type: "SYSTEM",
                                message: `Node not found: ${nodeId}`,
                                shouldCancelFlow: true
                            });
                        };

                        try {
                            await this.executeNodeWithRetries(node);
                            return { nodeId, success: true };
                        } catch (err) {
                            const error = this.normalizeError(err);

                            if (error.shouldCancelFlow) {
                                // 🔥 propagate immediately (DO NOT swallow)
                                throw error;
                            }

                            return {
                                nodeId,
                                success: false,
                                errorMessage: error.message,
                                errorType: error.type,
                                shouldCancelFlow: error.shouldCancelFlow
                            };
                        }
                    })
                )
            )

            const nextNodes: string[] = [];

            for (const r of result) {
                const { nodeId, success, errorMessage, errorType, shouldCancelFlow } = r;

                const children = this.adjacentList.get(nodeId) || [];

                if (!success) {

                    await this.markBranchBlocked(nodeId, errorMessage!, errorType!);
                    continue;
                }

                nextNodes.push(...children);
            }

            for (const childId of nextNodes) {
                if (this.blockedNodes.has(childId)) continue;

                const newDegree = (this.inDegree.get(childId) || 0) - 1;
                this.inDegree.set(childId, newDegree);

                if (newDegree === 0) queue.push(childId);
            }
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

    private async markBranchBlocked(nodeId: string, error: string, errorType: "VALIDATION" | "EXECUTION" | "SYSTEM") {
        const stack = [...(this.adjacentList.get(nodeId) || [])];

        while (stack.length > 0) {
            const current = stack.pop()!;

            const nodeData = this.nodeMap.get(current);
            if (!nodeData) continue;

            const status: ExecutionStatusType = errorType === "VALIDATION" ? "CANCELLED" : errorType === "EXECUTION" ? "ERROR" : "CRASHED";

            await this.publish({
                ...this.basePayload,
                nodeData: {
                    nodeId: nodeData.id,
                    nodeName: nodeData.name,
                    nodeStatus: NodeStatus.skipped
                },
                status: status,
                json: this.nodeOutputs.json,
                message: `${errorType}: Skipped due to upstream failure: ${error}`
            });

            const children = this.adjacentList.get(current) || [];

            for (const child of children) {
                if (!this.blockedNodes.has(child)) {
                    this.blockedNodes.add(child);
                    stack.push(child);
                }
            }
        }
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
                console.log("Publising");


                if (error.type === "VALIDATION") {

                    await this.publishNodeFailure(node.id, error.message, error.type);

                    throw error;
                }

                if (!error.isRetryable) {
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

        try {
            // skipping the LMCHAT execution for Workflow ???
            if (currentNode.name.includes("lmChat") || currentNode.type === "CHAT_MODEL") {
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

            await this.executeNodeByType(currentNode);

        } catch (err) {
            const error = this.normalizeError(err);

            await this.publish({
                ...this.basePayload,
                nodeData: {
                    nodeId: currentNode.id,
                    nodeName: currentNode.name,
                    nodeStatus: NodeStatus.failed
                },
                status: error.type === "VALIDATION" ? "CANCELLED" : error.type === "SYSTEM" ? "CRASHED" : "ERROR",
                message: error.message,
                json: this.nodeOutputs.json
            });

            throw new NodeExecutionError(error);
        }
    }

    async executeNodeByType(currentNode: Node) {
        const resolver = new ExpressionResolver(this.nodeOutputs.getOutputForResolver());
        const resolvedParameters = resolver.resolveParameters(currentNode.parameters);

        console.log("all resolved otuputs", this.nodeOutputs.getOutputForResolver());


        try {
            switch (currentNode.name) {
                case "manualTrigger":

                    this.nodeOutputs.addOutput({
                        nodeId: currentNode.id,
                        nodeName: currentNode.name,
                        json: currentNode.parameters
                    })

                    break;

                case "webhook":

                    this.nodeOutputs.addOutput({
                        nodeId: currentNode.id,
                        nodeName: currentNode.name,
                        json: currentNode.parameters,
                    });

                    break;

                case "agent":
                    const agent = predefinedNodesStructure.agent;

                    if (!agent || !agent.type) {
                        throw new NodeExecutionError({
                            type: "SYSTEM",
                            message: "Agent node type not configured",
                            shouldCancelFlow: true
                        });
                    }

                    const suppliedModelResult = await this.getConnectModel(currentNode);

                    if (!suppliedModelResult.success) {
                        throw new NodeExecutionError({
                            type: "VALIDATION",
                            message: suppliedModelResult.error || "Failed to connect to model",
                            shouldCancelFlow: true
                        });
                    }

                    const modelCommonPayload: NodeExecutionBasePayload = {
                        nodeData: {
                            nodeId: suppliedModelResult.modeNodeId!,
                            nodeName: currentNode.name,
                            nodeStatus: NodeStatus.executing
                        },
                        executionId: this.executionId,
                        workflowId: this.workflowId,
                        projectId: this.projectId
                    }

                    if (!agent.type.execute) {
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

                    const finalResult = {
                        output: agentResponse.data?.output,
                        message: "Agent processed prompt using connected model",
                    };

                    // await this.publish({
                    //     ...commonPayload,
                    //     status: "RUNNING",
                    //     message: "Agent Node",
                    //     response: { data: finalResult },
                    //     nodeData: commonPayload.nodeData ? {
                    //         ...commonPayload.nodeData,
                    //         nodeStatus: NodeStatus.success
                    //     } : undefined
                    // });

                    // await this.publish({
                    //     ...modelCommonPayload,
                    //     status: "RUNNING",
                    //     message: `Agent Node: ${currentNode.name} completed`,
                    //     nodeData: modelCommonPayload.nodeData ? {
                    //         ...modelCommonPayload.nodeData,
                    //         nodeStatus: NodeStatus.success
                    //     } : undefined
                    // })

                    this.nodeOutputs.addOutput({
                        nodeId: currentNode.id,
                        nodeName: currentNode.name,
                        json: { output: agentResponse.data.output },
                    });

                    break;

                case "telegram":
                    const telegram = predefinedNodesStructure.telegram;

                    if (!telegram || !telegram.type) {
                        throw new NodeExecutionError({
                            type: "SYSTEM",
                            message: "Telegram node type does not have execute method",
                            shouldCancelFlow: true
                        });
                    }

                    // ✅ VALIDATION LAYER (critical)
                    if (!resolvedParameters || !resolvedParameters.chatId || !resolvedParameters.text) {
                        throw new NodeExecutionError({
                            type: "VALIDATION",
                            message: "Telegram node requires 'chatId' and 'text' parameters",
                            shouldCancelFlow: true,
                            isRetryable: false
                        });
                    }

                    if (!telegram.type.execute) {
                        throw new NodeExecutionError({
                            type: "SYSTEM",
                            message: "Telegram node does not implement execute",
                            shouldCancelFlow: true
                        });
                    }

                    const telegramResponse = await telegram.type.execute({
                        parameters: resolvedParameters,
                        projectId: this.projectId!,
                        credentialId: currentNode.credentialId!
                    });

                    if (!telegramResponse || !telegramResponse.success) {
                        throw new NodeExecutionError({
                            type: "EXECUTION",
                            message: telegramResponse.error || "Telegram execution failed",
                            isRetryable: true
                        });
                    }

                    this.nodeOutputs.addOutput({
                        nodeId: currentNode.id,
                        nodeName: currentNode.name,
                        json: telegramResponse.data,
                    });

                    break;

                case "resend":
                    const resend = predefinedNodesStructure.resend;

                    if (!resend || !resend.type) {
                        throw new Error("Resend node type not found or not properly configured");
                    }

                    if (!resend.type.execute) {
                        throw new Error("Resend node type does not have execute method");
                    }

                    const resendResponse = await resend.type.execute({
                        parameters: resolvedParameters,
                        projectId: this.projectId!,
                        credentialId: currentNode.credentialId!
                    });

                    if (!resendResponse || !resendResponse.success) {
                        throw new NodeExecutionError({
                            type: "EXECUTION",
                            message: resendResponse.error || "Resend node execution failed",
                            isRetryable: true
                        });
                    }

                    this.nodeOutputs.addOutput({
                        nodeId: currentNode.id,
                        nodeName: currentNode.name,
                        json: resendResponse.data,
                    });

                    break;

                default: throw new Error(`Unknown or Unsupported type: ${currentNode.name}`)
            }
        } catch (err) {
            const error = this.normalizeError(err);

            throw new NodeExecutionError(error);
        }
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

    async getConnectModel(agentNode: Node) {
        const childNodes = this.getConnectedChildNodes(agentNode);
        const modelNodes = childNodes.filter((child) =>
            child.node.name.includes("lmChat") || child.handleType === "chat-model");

        if (modelNodes.length === 0) {
            throw new NodeExecutionError({
                type: "VALIDATION",
                message: "AI Agent requires exactly one Chat Model node",
                shouldCancelFlow: true
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
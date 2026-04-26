import type { Edge, ExecutionEventPublisher, ExecutionRunTimeInput, Node, NodeExecutionBasePayload, PublishPayloadDataType } from "@workspace/types";
import { NodeStatus } from "@workspace/types";
import { NodeOutput } from "./node-output";
import { updateExecutionStatusInDB } from "./db-helper";
import { constructErrorMessage } from "./error-provider";
import { ExpressionResolver } from "./expression-resolver";
import { predefinedNodesStructure } from "./execute-provider";
import pLimit from "p-limit";

const limit = pLimit(5);

export class WorkFlowRunner {
    workflowId: string | null = null;
    executionId: string | null = null;
    projectId: string | null = null;
    nodes: Node[] = [];
    edges: Edge[] = [];
    nodeOutputs: NodeOutput;
    private publisher: ExecutionEventPublisher;
    private nodeMap = new Map<string, Node>()
    private childrenMap = new Map<string, Edge[]>();
    private inDegree = new Map<string, number>();
    private adjacentList = new Map<string, string[]>();

    constructor(input: ExecutionRunTimeInput, publisher: ExecutionEventPublisher) {
        this.workflowId = input.workflowId;
        this.executionId = input.executionId;
        this.projectId = input.projectId;
        this.nodes = input.nodes;
        this.edges = input.edges;
        this.publisher = publisher;
        this.nodeOutputs = new NodeOutput();
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

    private async buildGraph() {
        const connectedNodesId = new Set<string>();

        for (const edge of this.edges) {
            connectedNodesId.add(edge.source);
            connectedNodesId.add(edge.target);
        }

        const disconnectNodes = this.nodes.filter(node => !connectedNodesId.has(node.id));
        console.log("Disconnected Nodes : ", disconnectNodes);


        const commonPaylod: NodeExecutionBasePayload = {
            executionId: this.executionId,
            workflowId: this.workflowId,
            projectId: this.projectId
        }

        if (disconnectNodes.length > 0) {
            console.warn("Disconnected nodes:", disconnectNodes);
        }

        for (const node of this.nodes) {
            this.inDegree.set(node.id, 0);
            this.adjacentList.set(node.id, []);
        }

        for (const edge of this.edges) {
            const { source, target } = edge;

            if (source === target) {
                throw new Error(`Loop: Self-loop detected at node: ${source}`);
            }

            if (!this.nodeMap.has(source) || !this.nodeMap.has(target)) {
                throw new Error(`Invalid edge: ${edge.source} -> ${edge.target}`);
            }

            this.adjacentList.get(source)?.push(target);
            this.inDegree.set(target, (this.inDegree.get(target) || 0) + 1);
        }
    }

    private findCycle(): string[] | null {
        const visited = new Set<string>();
        const stack = new Set<string>(); // recursion stack
        const parent = new Map<string, string | null>();

        const dfs = (nodeId: string): string[] | null => {
            visited.add(nodeId);
            stack.add(nodeId);

            for (const neighbor of this.adjacentList.get(nodeId) || []) {
                // case 1: not visited
                if (!visited.has(neighbor)) {
                    parent.set(neighbor, nodeId);
                    const cycle = dfs(neighbor);
                    if (cycle) return cycle;
                }
                // case 2: back edge → cycle found
                else if (stack.has(neighbor)) {
                    // reconstruct cycle path
                    const cycle: string[] = [neighbor];
                    let current: string | null = nodeId;

                    while (current && current !== neighbor) {
                        cycle.push(current);
                        current = parent.get(current) || null;
                    }

                    cycle.push(neighbor);
                    cycle.reverse();

                    return cycle;
                }
            }

            stack.delete(nodeId);
            return null;
        };

        for (const node of this.nodes) {
            if (!visited.has(node.id)) {
                parent.set(node.id, null);
                const cycle = dfs(node.id);
                if (cycle) return cycle;
            }
        }

        return null;
    }

    private async validateGraph() {

        const commonPaylod: NodeExecutionBasePayload = {
            executionId: this.executionId,
            workflowId: this.workflowId,
            projectId: this.projectId
        }

        const startNodes = this.nodes.filter(
            node => (this.inDegree.get(node.id) || 0) === 0
        );

        // 1. Must have at least one start node
        if (startNodes.length === 0) {
            await updateExecutionStatusInDB(this.executionId!, "ERROR", true);
            await this.publish({
                ...commonPaylod,
                status: "CRASHED",
                message: "No starting nodes found (possible cycle or invalid graph)",
            });
            throw new Error("No starting nodes found");
        }

        // 2. ALL start nodes must be triggers/webhooks
        const invalidStartNodes = startNodes.filter(
            node => node.type !== "TRIGGER" && node.type !== "WEBHOOK"
        );

        if (invalidStartNodes.length > 0) {
            await updateExecutionStatusInDB(this.executionId!, "ERROR", true);

            await this.publish({
                ...commonPaylod,
                status: "CRASHED",
                message: `Invalid workflow: Non-trigger nodes found as entry points (${invalidStartNodes.map(n => n.name).join(", ")})`,
            });

            throw new Error("Invalid start nodes");
        }

        // 2. cycle detection (fast Kahn check)
        const tempInDegree = new Map(this.inDegree);
        const queue = [...startNodes.map(n => n.id)];
        let processed = 0;

        while (queue.length > 0) {
            const nodeId = queue.shift()!;
            processed++;

            for (const child of this.adjacentList.get(nodeId) || []) {
                const deg = (tempInDegree.get(child) || 0) - 1;
                tempInDegree.set(child, deg);
                if (deg === 0) queue.push(child);
            }
        }

        if (processed !== this.inDegree.size) {
            const cycle = this.findCycle(); // optional DFS
            await updateExecutionStatusInDB(this.executionId!, "ERROR", true);

            await this.publish({
                ...commonPaylod,
                status: "CRASHED",
                message: cycle
                    ? `Cycle detected: ${cycle.join(" → ")}`
                    : "Cycle detected in workflow",
            });

            throw new Error("Cycle detected");
        }
    }

    async run() {
        console.log("Executing Workflow", this.nodes);
        await updateExecutionStatusInDB(this.executionId!, "RUNNING");

        await this.buildGraph();

        const commonPaylod: NodeExecutionBasePayload = {
            executionId: this.executionId,
            workflowId: this.workflowId,
            projectId: this.projectId
        }

        try {

            await this.validateGraph();

            const queue: string[] = [];
            for (const [nodeId, degree] of this.inDegree.entries()) {
                if (degree === 0) {
                    queue.push(nodeId);
                }
            }

            await this.processQueue(queue);

            await updateExecutionStatusInDB(this.executionId!, "SUCCESS", true);
            await this.publish({
                ...commonPaylod,
                status: "SUCCESS",
                json: this.nodeOutputs.json,
                message: "Workflow Execution Finished Successfully"
            })
        } catch (error) {
            await updateExecutionStatusInDB(this.executionId!, "ERROR", true);
            const errorMessage = constructErrorMessage(error);
            console.error("Workflow execution failed:", errorMessage);
        }
    }

    private async processQueue(queue: string[]) {
        while (queue.length > 0) {
            const currentBatch = [...queue];
            queue.length = 0;


            const result = await Promise.allSettled(
                currentBatch.map(nodeId =>
                    limit(async () => {
                        const node = this.nodeMap.get(nodeId);
                        if (!node) {
                            throw new Error(`Node not found: ${nodeId}`);
                        };
                        await this.executeWithRetry(node);
                        return this.adjacentList.get(nodeId) || [];
                    }))
            );

            const failed = result.find(r => r.status === "rejected");
            if (failed) throw failed.reason;

            const nextEdges: string[] = [];

            for (const r of result) {
                if (r.status === "fulfilled" && r.value) {
                    nextEdges.push(...r.value!);
                }
            }

            for (const childId of nextEdges) {
                const newDegree = (this.inDegree.get(childId) || 0) - 1;
                this.inDegree.set(childId, newDegree);

                if (newDegree === 0) {
                    queue.push(childId);
                }
            }
        }
    }

    private async executeWithRetry(node: Node) {
        const maxRetries = 3;
        let attempt = 0;

        const commonPayload: NodeExecutionBasePayload = {
            nodeData: {
                nodeId: node.id,
                nodeName: node.name,
                nodeStatus: NodeStatus.executing
            },
            executionId: this.executionId,
            workflowId: this.workflowId,
            projectId: this.projectId
        };

        while (attempt < maxRetries) {
            try {
                await this.executeSingleNode(node);

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
            } catch (error) {
                attempt++;

                if (attempt >= maxRetries) {
                    throw error;
                }

                const delay = 500 * Math.pow(2, attempt); // exponential backoff
                console.warn(`Retrying node ${node.name} (attempt ${attempt}) in ${delay}ms`);

                await new Promise(res => setTimeout(res, delay));
            }
        }
    }

    async executeSingleNode(currentNode: Node | null) {
        if (!currentNode) return;

        // if (this.nodeOutputs.json && this.nodeOutputs.json.has(currentNode.id)) {
        //     return;
        // }

        const commonPaylod: NodeExecutionBasePayload = {
            nodeData: {
                nodeId: currentNode.id,
                nodeName: currentNode.name,
                nodeStatus: NodeStatus.executing
            },
            executionId: this.executionId,
            workflowId: this.workflowId,
            projectId: this.projectId
        }

        await this.publish({
            ...commonPaylod,
            status: "RUNNING",
            message: `Executing Workflow Node: ${currentNode.name}`,
        })

        try {
            // skipping the LMCHAT execution for Workflow ???
            if (currentNode.type === "CHAT_MODEL") {
                console.info(`Skipping the model node ${currentNode.name} in the Execution Workflow`);

                await this.publish({
                    ...commonPaylod,
                    status: "RUNNING",
                    message: "Model Node Should Be Connected To Agent Node",
                    nodeData: commonPaylod.nodeData ? {
                        ...commonPaylod.nodeData,
                        nodeStatus: NodeStatus.failed
                    } : undefined
                })

                return;
            }

            // execute self node
            await this.executeNodeByType(currentNode, commonPaylod);

        } catch (error) {
            console.error(`Error Executing Workflow Node: ${currentNode.name}`, error);
            const errorMessage = constructErrorMessage(error);
            await this.publish({
                ...commonPaylod,
                status: "CRASHED",
                message: `Workflow Execution failed at Node ${currentNode.name}: ${errorMessage}`,
                json: this.nodeOutputs.json,
                error: errorMessage,
                nodeData: commonPaylod.nodeData ? {
                    ...commonPaylod.nodeData,
                    nodeStatus: NodeStatus.failed
                } : undefined
            })

            throw error;
        }
    }

    async executeNodeByType(currentNode: Node, commonPayload: NodeExecutionBasePayload) {
        const resolver = new ExpressionResolver(this.nodeOutputs.getOutputForResolver());
        const resolvedParameters = resolver.resolveParameters(currentNode.parameters);
        console.log("Resolved Parameters", resolvedParameters);

        switch (currentNode.name) {
            case "manualTrigger":
                // await this.publish({
                //     ...commonPayload,
                //     status: "RUNNING",
                //     message: "Manual Trigger Node",
                //     nodeData: commonPayload.nodeData ? {
                //         ...commonPayload.nodeData,
                //         nodeStatus: NodeStatus.success
                //     } : undefined
                // })

                this.nodeOutputs.addOutput({
                    nodeId: currentNode.id,
                    nodeName: currentNode.name,
                    json: currentNode.parameters
                })

                break;

            case "webhook":
                // await this.publish({
                //     ...commonPayload,
                //     status: "RUNNING",
                //     message: "Webhook Node",
                //     nodeData: commonPayload.nodeData ? {
                //         ...commonPayload.nodeData,
                //         nodeStatus: NodeStatus.success
                //     } : undefined
                // });

                this.nodeOutputs.addOutput({
                    nodeId: currentNode.id,
                    nodeName: currentNode.name,
                    json: currentNode.parameters,
                });

                break;

            case "agent":
                const agent = predefinedNodesStructure.agent;

                if (!agent || !agent.type) {
                    throw new Error("Agent node type not found or not properly configured");
                }

                const suppliedModelResult = await this.getConnectModel(currentNode);

                if (!suppliedModelResult.success) {
                    throw new Error(suppliedModelResult.error || "Failed to connect to model");
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

                // await this.publish({
                //     ...modelCommonPayload,
                //     status: "RUNNING",
                //     message: `Executing Agent Node: ${currentNode.name}`,
                // })

                if (!agent.type.execute) {
                    throw new Error("Agent node type does not have execute method");
                }

                const agentResponse = await agent.type.execute({
                    parameters: resolvedParameters,
                    model: suppliedModelResult.model
                });

                if (!agentResponse || !agentResponse.success) {
                    throw new Error(agentResponse.error || "Agent node execution failed");
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
                    throw new Error(
                        "Telegram node type not found or not properly configured"
                    );
                }

                if (!telegram.type.execute) {
                    throw new Error("Telegram node type does not have execute method");
                }

                const telegramResponse = await telegram.type.execute({
                    parameters: resolvedParameters,
                    projectId: this.projectId!,
                    credentialId: currentNode.credentialId!
                });

                if (!telegramResponse || !telegramResponse.success) {
                    throw new Error(telegramResponse.error || "Telegram node execution failed");
                }

                // await this.publish({
                //     ...commonPayload,
                //     status: "RUNNING",
                //     message: "Telegram Node",
                //     response: { data: telegramResponse.data },
                //     nodeData: commonPayload.nodeData ? {
                //         ...commonPayload.nodeData,
                //         nodeStatus: NodeStatus.success
                //     } : undefined
                // })

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
                    throw new Error(resendResponse.error || "Resend node execution failed");
                }

                // await this.publish({
                //     ...commonPayload,
                //     status: "RUNNING",
                //     message: "Resend Node",
                //     response: { data: resendResponse.data },
                //     nodeData: commonPayload.nodeData ? {
                //         ...commonPayload.nodeData,
                //         nodeStatus: NodeStatus.success
                //     } : undefined
                // })

                this.nodeOutputs.addOutput({
                    nodeId: currentNode.id,
                    nodeName: currentNode.name,
                    json: resendResponse.data,
                });

                break;

            default: throw new Error(`Unknown or Unsupported type: ${currentNode.name}`)
        }

    }

    getConnectedNode(currentNode: Node) {
        const currentNodeId = currentNode.id;
        const targetNodeId = this.edges.find(
            (edge) => edge.source === currentNodeId
        )?.target;
        const nextNode = this.nodeMap.get(targetNodeId!);

        return nextNode || null;
    }

    getConnectedChildNodes(
        parentNode: Node
    ): { node: Node; handleType: string | null }[] {
        const parentNodeId = parentNode.id;
        const childEdges = this.childrenMap.get(parentNodeId) || [];

        return childEdges
            .map((edge) => {
                const childNode = this.nodeMap.get(edge.target);

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
            child.node.type === "CHAT_MODEL" || child.handleType === "chat-model");

        if (modelNodes.length === 0) {
            return {
                success: false,
                model: null,
                error: "Problem in node 'AI Agent'\nA Chat Model sub- node must be connected and enabled",
            }
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
import { Edge, ExecutionEventPublisher, ExecutionRunTimeInput, Node, NodeExecutionBasePayload, NodeStatus, PublishPayloadDataType } from "@workspace/types";
import { NodeOutput } from "./node-output.js";
import { updateExecutionStatusInDB } from "./db-helper.js";
import { constructErrorMessage } from "./error-provider.js";
import { ExpressionResolver } from "./expression-resolver.js";
import { predefinedNodesStructure } from "./execute-provider.js";

export class WorkFlowRunner {
    workflowId: string | null = null;
    executionId: string | null = null;
    projectId: string | null = null;
    nodes: Node[] = [];
    edges: Edge[] = [];
    nodeOutputs: NodeOutput;
    private publisher: ExecutionEventPublisher;

    constructor(input: ExecutionRunTimeInput, publisher: ExecutionEventPublisher) {
        this.workflowId = input.workflowId;
        this.executionId = input.executionId;
        this.projectId = input.projectId;
        this.nodes = input.nodes;
        this.edges = input.edges;
        this.publisher = publisher;
        this.nodeOutputs = new NodeOutput();
    }

    private async publish(payload: PublishPayloadDataType) {
        await this.publisher.publish(payload);
    }

    async run() {
        console.log("Executing Workflow", this.nodes);
        await updateExecutionStatusInDB(this.executionId!, "RUNNING");

        const triggerNode = this.nodes.find((node) => node.type === "TRIGGER");

        const commonPaylod: NodeExecutionBasePayload = {
            executionId: this.executionId,
            workflowId: this.workflowId,
            projectId: this.projectId
        }

        if (!triggerNode) {
            await updateExecutionStatusInDB(this.executionId!, "ERROR", true);
            await this.publish({
                ...commonPaylod,
                status: "FAILED",
                message: "No Trigger Node Found For Execution",
            });
            return;
        }

        try {
            await this.executeNode(triggerNode);

            console.info("Workflow execution completed successfully");
            await updateExecutionStatusInDB(this.executionId!, "SUCCESS", true);
            await this.publish({
                ...commonPaylod,
                status: "SUCCESS",
                message: "Workflow Execution Finished Successfully"
            })
        } catch (error) {
            await updateExecutionStatusInDB(this.executionId!, "ERROR", true);
            const errorMessage = constructErrorMessage(error);
            console.error("Workflow execution failed:", errorMessage);
        }

    }

    async executeNode(currentNode: Node | null) {
        if (!currentNode) return;

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
            if (currentNode.name.includes("lmChat") || currentNode.type === "CHAT_MODEL") {
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

                // Get next connected node
                const nextNode = this.getConnectedNode(currentNode);
                await this.executeNode(nextNode);
                return;
            }

            // execute self node
            await this.executeNodeByType(currentNode, commonPaylod);

            // execute all child nodes
            const childNodes = this.getConnectedChildNodes(currentNode);
            if (childNodes.length > 0) {
                for (const child of childNodes) {
                    await this.executeNode(child.node);
                }
            }

        } catch (error) {
            console.error(`Error Executing Workflow Node: ${currentNode.name}`, error);
            const errorMessage = constructErrorMessage(error);
            await this.publish({
                ...commonPaylod,
                status: "FAILED",
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

        console.log("Original Parameters", currentNode.parameters);
        console.log("Resolved Parameters", resolvedParameters);

        switch (currentNode.name) {
            case "manualTrigger":
                await this.publish({
                    ...commonPayload,
                    status: "RUNNING",
                    message: "Manual Trigger Node",
                    nodeData: commonPayload.nodeData ? {
                        ...commonPayload.nodeData,
                        nodeStatus: NodeStatus.success
                    } : undefined
                })

                this.nodeOutputs.addOutput({
                    nodeId: currentNode.id,
                    nodeName: currentNode.name,
                    json: currentNode.parameters
                })

                break;

            case "webhook":
                await this.publish({
                    ...commonPayload,
                    status: "RUNNING",
                    message: "Webhook Node",
                    nodeData: commonPayload.nodeData ? {
                        ...commonPayload.nodeData,
                        nodeStatus: NodeStatus.success
                    } : undefined
                });

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

                await this.publish({
                    ...modelCommonPayload,
                    status: "RUNNING",
                    message: `Executing Agent Node: ${currentNode.name}`,
                })

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

                await this.publish({
                    ...commonPayload,
                    status: "RUNNING",
                    message: "Agent Node",
                    response: { data: finalResult },
                    nodeData: commonPayload.nodeData ? {
                        ...commonPayload.nodeData,
                        nodeStatus: NodeStatus.success
                    } : undefined
                });

                await this.publish({
                    ...modelCommonPayload,
                    status: "RUNNING",
                    message: `Agent Node: ${currentNode.name} completed`,
                    nodeData: modelCommonPayload.nodeData ? {
                        ...modelCommonPayload.nodeData,
                        nodeStatus: NodeStatus.success
                    } : undefined
                })

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

                await this.publish({
                    ...commonPayload,
                    status: "RUNNING",
                    message: "Telegram Node",
                    response: { data: telegramResponse.data },
                    nodeData: commonPayload.nodeData ? {
                        ...commonPayload.nodeData,
                        nodeStatus: NodeStatus.success
                    } : undefined
                })

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

                await this.publish({
                    ...commonPayload,
                    status: "RUNNING",
                    message: "Resend Node",
                    response: { data: resendResponse.data },
                    nodeData: commonPayload.nodeData ? {
                        ...commonPayload.nodeData,
                        nodeStatus: NodeStatus.success
                    } : undefined
                })

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
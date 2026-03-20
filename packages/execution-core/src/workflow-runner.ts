import { Edge, ExecutionEventPublisher, ExecutionRunTimeInput, Node, NodeExecutionBasePayload, NodeStatus } from "@workspace/types";
import { NodeOutput } from "./node-output.js";
import { updateExecutionStatusInDB } from "./db-helper.js";
import { constructErrorMessage } from "./error-provider.js";

export class WorkFlowRunner {
    workflowId: string | null = null;
    executionId: string | null = null;
    nodes: Node[] = [];
    edges: Edge[] = [];
    nodeOutputs: NodeOutput;
    private publisher: ExecutionEventPublisher;

    constructor(input: ExecutionRunTimeInput, publisher: ExecutionEventPublisher) {
        this.workflowId = input.workflowId;
        this.executionId = input.executionId;
        this.nodes = input.nodes;
        this.edges = input.Edges;
        this.publisher = publisher;
        this.nodeOutputs = new NodeOutput();
    }

    private async publish(payload: Record<string, unknown>) {
        await this.publisher.publish(payload);
    }

    async run() {
        console.log("Executing Workflow", this.nodes);
        await updateExecutionStatusInDB(this.executionId!, "RUNNING");

        const triggerNode = this.nodes.find((node) => node.type === "TRIGGER");

        if (!triggerNode) {
            await updateExecutionStatusInDB(this.executionId!, "ERROR", true);
            await this.publish({
                executionId: this.executionId,
                status: "FAILED",
                message: "No Trigger Node Found For Execution"
            });
            return;
        }

        try {
            await this.executeNode(triggerNode);

            console.info("Workflow execution completed successfully");
            await updateExecutionStatusInDB(this.executionId!, "SUCCESS", true);
            await this.publish({
                executionId: this.executionId,
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
            nodeId: currentNode.id,
            nodeName: currentNode.name,
            executionId: this.executionId,
            workflowId: this.workflowId
        }

        await this.publish({
            ...commonPaylod,
            status: "RUNNING",
            messagge: `Executing Workflow Node: ${currentNode.name}`,
            nodeStatus: NodeStatus.executing
        })

        try {
            // skipping the LMCHAT execution for Workflow ???
            if (currentNode.name === "lmChatModel" || currentNode.type === "CHAT_MODEL") {
                console.info(`Skipping the model node ${currentNode.name} in the Execution Workflow`);

                await this.publish({
                    ...commonPaylod,
                    status: "RUNNING",
                    message: "Model Node Should Be Connected To Agent Node",
                    nodeStatus: NodeStatus.failed
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
                response: { error: errorMessage },
                nodeStatus: NodeStatus.failed
            })

            throw error;
        }
    }

    async executeNodeByType(currentNode: Node, commonPayload: NodeExecutionBasePayload) {

        // TODO :Understand Express resolver clearly

        switch (currentNode.name) {
            case "manualTrigger":

                break;
            case "webhook":

                break;
            case "agent":

                break;
            case "telegram":

                break;
            case "resend":

                break;

            default:
                throw new Error(`Unknown or Unsupported type: ${currentNode.name}`)
                break;
        }

    }

    getConnectedNode(currentNode: Node) {
        const currentNodeId = currentNode.id;
        const targetNode = this.edges.find(
            (edge) => edge.source === currentNodeId
        )?.target;
        const nextNode = this.nodes.find((node) => node.id === targetNode);
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

}

export const runWorkflowExecution = async (
    input: ExecutionRunTimeInput,
    publisher: ExecutionEventPublisher
) => {
    const runner = new WorkFlowRunner(input, publisher);
    await runner.run();
}
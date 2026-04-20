import { ActionNode } from "@/components/custom-nodes/action-node";
import { AgentNode } from "@/components/custom-nodes/agent-node";
import { ModelNode } from "@/components/custom-nodes/model-node";
import { TriggerNode } from "@/components/custom-nodes/trigger-node";
import { NodeName, NodeType } from "@workspace/types";


export const nodeTypes: Record<NodeType, React.ComponentType<any>> = {
    TRIGGER: TriggerNode,
    WEBHOOK: TriggerNode,
    ACTION: ActionNode,
    AGENT: AgentNode,
    CHAT_MODEL: ModelNode,
}
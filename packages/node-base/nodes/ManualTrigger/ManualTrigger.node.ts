import type { NodeBaseDescription, NodeBaseType, NodeType } from "@workspace/types"

export class ManualTrigger implements NodeBaseType {
    nodeType: NodeType = "TRIGGER";
    description: NodeBaseDescription = {
        displayName: "Manual Trigger",
        name: "manualTrigger",
        nodeType: "TRIGGER",
        description: "Runs the flow on clicking a button in n8n",
        version: 1,
        icon: {
            type: "file",
            value: "manualTrigger.svg"
        },
        group: ["TRIGGER"],
        defaults: {
            name: "When clicking 'Execute workflow'",
            color: "#909298",
        },
        eventTriggerDescription: "",
        maxNodes: 1,
        properties: [
            {
                displayName:
                    'This node is where the workflow execution starts',
                name: "notice",
                type: "NOTICE",
                default: "",
            },
        ],
    };
}
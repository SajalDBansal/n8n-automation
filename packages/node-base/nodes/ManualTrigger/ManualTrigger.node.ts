import type { NodeMetaData } from "@workspace/types";

export const ManualTriggerMetaData: NodeMetaData = {
    nodeType: "TRIGGER",
    description: {
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
                displayName: 'This node is where the workflow execution starts',
                name: "notice",
                type: "NOTICE",
                default: "",
            },
        ],
    }
}
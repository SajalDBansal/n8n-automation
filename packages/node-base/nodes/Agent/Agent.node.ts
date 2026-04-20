import type { NodeMetaData } from "@workspace/types";

export const AgentMetaData: NodeMetaData = {
    nodeType: "AGENT",
    description: {
        displayName: "AI Agent",
        name: "agent",
        nodeType: "AGENT",
        description: "Generates an action plan and executes it.",
        version: 1,
        icon: {
            type: "lucide",
            value: "Bot",
            color: "black",
        },
        group: ["TRANSFORM"],
        defaults: {
            name: "Ai Agent",
        },
        properties: [
            {
                displayName: "User Message",
                name: "prompt",
                type: "STRING",
                default: "",
                placeholder: "Enter your message or task for the AI agent...",
                description: "The message or task you want the AI agent to process",
            }
        ],
    },
}
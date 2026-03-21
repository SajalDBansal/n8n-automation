import type { NodeBaseDescription, NodeBaseType, NodeType } from "@workspace/types";
import { generateText } from "ai";

export class Agent implements NodeBaseType {
    nodeType: NodeType = "AGENT";
    description: NodeBaseDescription = {
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
    };

    async execute({
        parameters,
        model
    }: {
        parameters: any;
        model: any;
    }): Promise<{ success: boolean; data?: any; error?: string }> {

        try {


            console.log("params -------> ", { parameters, model });

            if (!parameters) {
                console.error("parameters are not provided");
                return { success: false, error: "parameters are not provided" };
            }

            const { prompt } = parameters;

            if (!prompt.trim()) {
                return {
                    success: false,
                    error: "User message is required..",
                };
            }

            const response = await generateText({
                model, prompt: prompt.trim()
            })

            const agentResult = {
                prompt: prompt.trim(),
                timestamp: new Date().toISOString(),
                status: "processed",
                output: response.text,
                response: response,
            };

            return {
                success: true,
                data: agentResult
            }

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error occcured in agent execution"
            }

        }
    }
}
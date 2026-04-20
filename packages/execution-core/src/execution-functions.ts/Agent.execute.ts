import type { NodeExecutionType } from "@workspace/types";
import { generateText } from "ai";

export const Agent: NodeExecutionType = {
    execute: async ({
        parameters,
        model
    }: {
        parameters: any;
        model: any;
    }): Promise<{ success: boolean; data?: any; error?: string }> => {

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
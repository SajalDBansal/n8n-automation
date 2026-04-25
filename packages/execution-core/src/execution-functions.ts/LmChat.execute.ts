
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { NodeExecutionType, SupplyData } from "@workspace/types";
import { getCredentials } from "../get-credentials";

export const LmChatGoogleGemini: NodeExecutionType = {

    supplyData: async (params: { parameters: any; credentialId: string; projectId: string }): Promise<SupplyData> => {
        try {
            const { parameters, credentialId, projectId } = params;
            const { modelId } = parameters;

            if (!modelId) throw new Error("Model Id is required");
            if (!credentialId) throw new Error("Credentials Id is required");
            if (!projectId) throw new Error("Project Id is required");

            const credentials = await getCredentials<{ apiKey: string }>(credentialId, projectId);

            if (!credentials?.apiKey) throw new Error("API Key not found");

            const google = createGoogleGenerativeAI({ apiKey: credentials.apiKey });

            const model = google(modelId || "gemini-2.5-flash");

            return {
                success: true,
                model: model,
            }

        } catch (error) {
            console.log("Gemini model supply error: ", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error in model supply"
            }
        }
    },

    execute: async ({
        parameters
    }: any): Promise<{ success: boolean; data?: any; error?: string }> => {
        console.warn(
            "Model node executed directly - models should be connected to agent's sub-component handles"
        );

        return {
            success: true,
            data: {
                message:
                    "Model node should be connected to agent node's bottom handles, not executed directly",
                modelName: parameters.parameters?.modelName || "gemini-1.5-flash",
            },
        };
    }
}   
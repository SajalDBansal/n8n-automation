import type { NodeBaseDescription, NodeBaseType, NodeType, SupplyData } from "@workspace/types";
import { generateText } from "ai";
import { getCredentials } from "../../../nodes-data/credentials/credentials";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export class LmChatGoogleGemini implements NodeBaseType {
    nodeType: NodeType = "CHAT_MODEL";
    description: NodeBaseDescription = {
        displayName: "Google Gemini Chat Model",
        name: "lmChatGoogleGemini",
        nodeType: "CHAT_MODEL",
        description: "Chat Model Google Gemini",
        version: 1,
        icon: {
            type: "file",
            value: "google.svg",
        },
        group: ["TRANSFORM", "MODEL"],
        defaults: {
            name: "Google Gemini Chat Model",
        },
        outputNames: ["model"],
        credentials: [
            {
                name: "googleGeminiApi",
                required: true,
            },
        ],
        properties: [
            {
                displayName: "Model",
                name: "modelId",
                type: "OPTIONS",
                description:
                    'The model which will generate the completion. <a href="https://developers.generativeai.google/api/rest/generativelanguage/models/list">Learn more</a>.',
                options: [
                    {
                        name: "gemini-2.5-flash",
                        value: "gemini-2.5-flash",
                        description:
                            "Stable version of Gemini 2.5 Flash, mid-size multimodal model with 1M context, June 2025 release.",
                    },
                    {
                        name: "gemini-2.5-pro",
                        value: "gemini-2.5-pro",
                        description:
                            "Latest flagship Gemini 2.5 Pro model, state-of-the-art reasoning and multimodal support.",
                    },
                    {
                        name: "gemini-2.0-flash-lite",
                        value: "gemini-2.0-flash-lite",
                        description:
                            "Lightweight, cost-efficient Gemini 2.0 Flash Lite model for fast inference.",
                    },
                    {
                        name: "gemini-1.5-pro",
                        value: "gemini-1.5-pro",
                        description:
                            "Gemini 1.5 Pro with advanced reasoning and multimodal support, large context window.",
                    },
                    {
                        name: "gemini-1.5-flash",
                        value: "gemini-1.5-flash",
                        description:
                            "Gemini 1.5 Flash, optimized for speed and efficiency with long context.",
                    },
                    {
                        name: "gemini-pro",
                        value: "gemini-pro",
                        description:
                            "Earlier Gemini Pro model, reliable for text-only generation.",
                    },
                    {
                        name: "gemini-flash",
                        value: "gemini-flash",
                        description:
                            "Earlier Gemini Flash model, fast inference, smaller context size.",
                    },
                ],
                default: "gemini-2.5-flash",
            },
        ],
    };

    async supplyData(params: { parameters: any; credentialId: string; projectId: string }): Promise<SupplyData> {
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
    }

    async execute({
        parameters
    }: any): Promise<{ success: boolean; data?: any; error?: string }> {
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
import type { NodeMetaData } from "@workspace/types";

export const LmChatGoogleGeminiMetaData: NodeMetaData = {
    nodeType: "CHAT_MODEL",
    description: {
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
    },
}   
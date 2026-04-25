import { ManualTriggerMetaData } from "@workspace/node-base/nodes/ManualTrigger/ManualTrigger.node";
import { TelegramMetaData } from "@workspace/node-base/nodes/Telegram/Telegram.node";
import { WebhookMetaData } from "@workspace/node-base/nodes/Webhook/Webhook.node";
import type { NodeBaseType, NodeName } from "@workspace/types";
import { Telegram } from "./execution-functions.ts/helper-function/Telegram.execute";
import { Resend } from "./execution-functions.ts/Resend.execute";
import { ResendMetaData } from "@workspace/node-base/nodes/Resend/Resend.node";
import { Agent } from "./execution-functions.ts/Agent.execute";
import { AgentMetaData } from "@workspace/node-base/nodes/Agent/Agent.node";
import { LmChatGoogleGeminiMetaData } from "@workspace/node-base/nodes/lmChat/LmChatGoogleGemini/LmChat.node";
import { LmChatGoogleGemini } from "./execution-functions.ts/LmChat.execute";

export const predefinedNodesStructure: Record<NodeName, NodeBaseType> = {
    manualTrigger: {
        type: ManualTriggerMetaData,
    },
    webhook: {
        type: WebhookMetaData
    },
    telegram: {
        type: { ...TelegramMetaData, ...Telegram }
    },
    resend: {
        type: { ...ResendMetaData, ...Resend }
    },
    agent: {
        type: { ...AgentMetaData, ...Agent }
    },
    lmChatGoogleGemini: {
        type: { ...LmChatGoogleGeminiMetaData, ...LmChatGoogleGemini }
    }
}
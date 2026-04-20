import { ManualTriggerMetaData } from "@workspace/node-base/nodes/ManualTrigger/ManualTrigger.node.js";
import { TelegramMetaData } from "@workspace/node-base/nodes/Telegram/Telegram.node.js";
import { WebhookMetaData } from "@workspace/node-base/nodes/Webhook/Webhook.node.js";
import { NodeBaseType, NodeName } from "@workspace/types";
import { Telegram } from "./execution-functions.ts/helper-function/Telegram.execute.js";
import { Resend } from "./execution-functions.ts/Resend.execute.js";
import { ResendMetaData } from "@workspace/node-base/nodes/Resend/Resend.node.js";
import { Agent } from "./execution-functions.ts/Agent.execute.js";
import { AgentMetaData } from "@workspace/node-base/nodes/Agent/Agent.node.js";
import { LmChatGoogleGeminiMetaData } from "@workspace/node-base/nodes/lmChat/LmChatGoogleGemini/LmChat.node.js";
import { LmChatGoogleGemini } from "./execution-functions.ts/LmChat.execute.js";

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
import { AgentMetaData } from "../nodes/Agent/Agent.node";
import { LmChatGoogleGeminiMetaData } from "../nodes/lmChat/LmChatGoogleGemini/LmChat.node";
import { ManualTriggerMetaData } from "../nodes/ManualTrigger/ManualTrigger.node";
import { ResendMetaData } from "../nodes/Resend/Resend.node";
import { TelegramMetaData } from "../nodes/Telegram/Telegram.node";
import { WebhookMetaData } from "../nodes/Webhook/Webhook.node";
import { GmailOAuth2Api } from "./credentials/GmailOAuth2Api.credentials";
import { GoogleGeminiApi } from "./credentials/GoogleGeminiApi.credentials";
import { ResendApi } from "./credentials/ResendApi.credentials";
import { TelegramApi } from "./credentials/TelegramApi.credentials";
import type { NodeName, NodeMetaData, NodeCredentialsName, NodeCredentialsType } from "@workspace/types";

export const PredefinedNodeMetaData: Record<NodeName, NodeMetaData> = {
    manualTrigger: ManualTriggerMetaData,
    webhook: WebhookMetaData,
    telegram: TelegramMetaData,
    resend: ResendMetaData,
    agent: AgentMetaData,
    lmChatGoogleGemini: LmChatGoogleGeminiMetaData,
}

export const predefinedCredentialsStructure: Record<NodeCredentialsName, NodeCredentialsType> = {
    gmailOAuth2Api: GmailOAuth2Api,
    googleGeminiApi: GoogleGeminiApi,
    resendApi: ResendApi,
    telegramApi: TelegramApi
}
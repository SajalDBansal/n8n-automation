import { Agent } from "../nodes/Agent/Agent.node";
import { LmChatGoogleGemini } from "../nodes/lmChat/LmChatGoogleGemini/LmChat.node";
import { ManualTrigger } from "../nodes/ManualTrigger/ManualTrigger.node";
import { Resend } from "../nodes/Resend/Resend.node";
import { Telegram } from "../nodes/Telegram/Telegram.node";
import { Webhook } from "../nodes/Webhook/Webhook.node";
import { GmailOAuth2Api } from "./credentials/GmailOAuth2Api.credentials";
import { GoogleGeminiApi } from "./credentials/GoogleGeminiApi.credentials";
import { ResendApi } from "./credentials/ResendApi.credentials";
import { TelegramApi } from "./credentials/TelegramApi.credentials";

export const predefinedNodesStructure = {
    "node-base.manualTrigger": {
        type: new ManualTrigger(),
    },
    "node-base.webhook": {
        type: new Webhook()
    },
    "node-base.telegram": {
        type: new Telegram()
    },
    "node-base.resend": {
        type: new Resend()
    },
    "node-base.agent": {
        type: new Agent()
    },
    "node-base.lmChatGoogleGemini": {
        type: new LmChatGoogleGemini()
    },
}


export const predefinedCredentialsStructure = {
    "node-credentials.googleOAuth2": {
        type: new GmailOAuth2Api()
    },
    "node-credentials.googleGemeni": {
        type: new GoogleGeminiApi()
    },
    "node-credentials.resend": {
        type: new ResendApi()
    },
    "node-credentials.telegram": {
        type: new TelegramApi()
    },
}
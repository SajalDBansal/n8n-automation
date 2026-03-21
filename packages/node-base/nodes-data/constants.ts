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
    manualTrigger: {
        type: new ManualTrigger(),
    },
    webhook: {
        type: new Webhook()
    },
    telegram: {
        type: new Telegram()
    },
    resend: {
        type: new Resend()
    },
    agent: {
        type: new Agent()
    },
    lmChatModels: [
        {
            name: "lmChatGoogleGemini",
            type: new LmChatGoogleGemini()
        },
    ]

}


export const predefinedCredentialsStructure = {
    googleOAuth2: {
        type: new GmailOAuth2Api()
    },
    lmChatGoogleGemini: {
        type: new GoogleGeminiApi()
    },
    resend: {
        type: new ResendApi()
    },
    telegram: {
        type: new TelegramApi()
    },
}
import type { NodeMetaData } from "@workspace/types";

export const TelegramMetaData: NodeMetaData = {
    nodeType: "ACTION",
    description: {
        displayName: "Telegram",
        name: "telegram",
        nodeType: "ACTION",
        description: "Sends data to Telegram",
        version: 1,
        icon: {
            type: "file",
            value: "telegram.svg"
        },
        group: ["OUTPUT"],
        defaults: {
            name: "Telegram",
        },
        credentials: [
            {
                name: "telegramApi",
                required: true,
            },
        ],
        properties: [
            {
                displayName: "Resource",
                name: "resource",
                type: "OPTIONS",
                noDataExpression: true,
                options: [
                    {
                        name: "Message",
                        value: "message",
                    },
                ],
                default: "message",
            },

            {
                displayName: "Operation",
                name: "operation",
                type: "OPTIONS",
                noDataExpression: true,
                description: "The operation to perform",
                options: [
                    {
                        name: "Send Message",
                        value: "sendMessage",
                    },
                ],
                default: "sendMessage",
            },

            // ----------------------------------
            //         chat / message
            // ----------------------------------

            {
                displayName: "Chat ID",
                name: "chatId",
                type: "STRING",
                default: "",
                required: true,
                description:
                    "Unique identifier for the target chat or username, To find your chat ID ask @getinfobot",
            },
            {
                displayName: "Text",
                name: "text",
                type: "STRING",
                default: "",
                required: true,
            },
        ],
    }
}
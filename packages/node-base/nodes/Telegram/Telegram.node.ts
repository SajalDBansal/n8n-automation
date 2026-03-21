import type { NodeBaseDescription, NodeBaseType, NodeType } from "@workspace/types";
import prisma from "@workspace/database"

export class Telegram implements NodeBaseType {
    nodeType: NodeType = "ACTION";
    description: NodeBaseDescription = {
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
                options: [
                    {
                        name: "Send Message",
                        value: "sendMessage",
                        description: "Send a text message",
                        action: "Send a text message",
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
    };

    async execute({
        parameters,
        projectId,
        credentialId,
    }: {
        parameters: Record<string, unknown>;
        projectId: string;
        credentialId: string;
    }): Promise<{ success: boolean; data?: any; error?: string }> {
        console.log("params -------> ", { parameters, projectId, credentialId });

        if (!parameters || !parameters.chatId || !parameters.text) {
            console.error("parameters are not provided");
            return { success: false, error: "parameters are not provided" };
        }

        if (!projectId) {
            console.error("projectId is not provided");
            return {
                success: false,
                error: "projectId is not provided",
            };
        }

        if (!credentialId) {
            console.error("credentialId is not provided");
            return {
                success: false,
                error: "credential is not provided",
            };
        }

        const credential = await prisma.credential.findFirst({
            where: { id: credentialId, projectId: projectId },
            select: { data: true },
        }) as { data: { accessToken: string } } | null;

        console.log("feteched credential ----> ", credential);
        const url = `https://api.telegram.org/bot${credential?.data?.accessToken}/sendMessage?chat_id=${parameters.chatId}&text=${parameters.text}`;

        const response = await fetch(url);
        const data = (await response.json()) as any;

        if (!data?.ok) {
            return { success: false, error: "Bad Request" };
        }

        console.log(JSON.stringify(data, null, 2));

        return { success: true, data };
    }
}
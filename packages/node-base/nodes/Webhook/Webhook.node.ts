import type { NodeBaseDescription, NodeBaseType, NodeType } from "@workspace/types";

export class Webhook implements NodeBaseType {
    nodeType: NodeType = "WEBHOOK";
    description: NodeBaseDescription = {
        displayName: "Webhook",
        name: "webhook",
        nodeType: "WEBHOOK",
        description: "Starts the workflow when a webhook is called",
        version: 1,
        icon: {
            type: "file",
            value: "webhook.svg"
        },
        group: ["TRIGGER"],
        defaults: {
            name: "Webhook",
        },
        eventTriggerDescription: "Waiting for you to call the Test URL",
        activationMessage: "You can now make calls to your production webhook URL.",
        supportsCORS: true,
        properties: [
            {
                displayName: "HTTP Methods",
                name: "httpMethod",
                type: "OPTIONS",
                options: [
                    {
                        name: "DELETE",
                        value: "DELETE",
                    },
                    {
                        name: "GET",
                        value: "GET",
                    },
                    {
                        name: "HEAD",
                        value: "HEAD",
                    },
                    {
                        name: "PATCH",
                        value: "PATCH",
                    },
                    {
                        name: "POST",
                        value: "POST",
                    },
                    {
                        name: "PUT",
                        value: "PUT",
                    },
                ],
                default: "GET",
                description: "The HTTP methods to listen to",
            },
            {
                displayName: "Path",
                name: "path",
                type: "STRING",
                default: "",
                placeholder: "webhook",
                description:
                    "The path to listen to, dynamic values could be specified by using ':', e.g. 'your-path/:dynamic-value'. If dynamic values are set 'webhookId' would be prepended to path.",
            },
        ],
    };
}
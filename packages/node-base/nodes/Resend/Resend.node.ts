import type { NodeMetaData } from "@workspace/types";

const resendIconUrl = "https://img.icons8.com/?size=100&id=nyD0PULzXd9Q&format=png&color=000000";

export const ResendMetaData: NodeMetaData = {
    nodeType: "ACTION",
    description: {
        displayName: "Resend",
        name: "resend",
        nodeType: "ACTION",
        description: "Send emails with Resend",
        version: 1,
        icon: {
            type: "url",
            value: resendIconUrl,
            color: "green",
        },
        group: ["OUTPUT"],
        defaults: {
            name: "Resend",
        },
        credentials: [
            {
                name: "resendApi",
                required: true,
            },
        ],
        properties: [
            {
                displayName: "From",
                name: "from",
                type: "STRING",
                description: "The email address to send from",
                default: "",
                required: true,
            },
            {
                displayName: "To",
                name: "to",
                type: "STRING",
                description: "The email address to send to",
                default: "",
                required: true,
            },
            {
                displayName: "Subject",
                name: "subject",
                type: "STRING",
                description: "The subject of the email",
                default: "",
                required: true,
            },
            {
                displayName: "HTML",
                name: "html",
                type: "STRING",
                description: "The HTML content of the email",
                default: "",
                required: true,
            },
        ],
    }
}
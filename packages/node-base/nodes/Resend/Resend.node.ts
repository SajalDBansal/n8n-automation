import type { NodeBaseDescription, NodeBaseType, NodeType } from "@workspace/types";
import prisma from "@workspace/database"
import { ResendEmailService } from "./resend-function";

const resendIconUrl = "https://img.icons8.com/?size=100&id=nyD0PULzXd9Q&format=png&color=000000";

export class Resend implements NodeBaseType {
    nodeType: NodeType = "ACTION";
    description: NodeBaseDescription = {
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
                default: "",
                required: true,
            },
            {
                displayName: "To",
                name: "to",
                type: "STRING",
                default: "",
                required: true,
            },
            {
                displayName: "Subject",
                name: "subject",
                type: "STRING",
                default: "",
                required: true,
            },
            {
                displayName: "HTML",
                name: "html",
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
    }: any): Promise<{ success: boolean; data?: any; error?: string }> {
        console.log("params -------> ", { parameters, projectId, credentialId });

        if (!parameters) {
            console.error("parameters are not provided");
            return { success: false, error: "parameters are not provided" };
        }

        if (!projectId) {
            console.error("projectId is not provided");
            return {
                success: false, error: "projectId is not provided",
            };
        }

        if (!credentialId) {
            console.error("credentialId is not provided");
            return {
                success: false, error: "credential is not provided",
            };
        }

        const credential = await prisma.credential.findFirst({
            where: { id: credentialId, projectId: projectId },
            select: { data: true },
        }) as { data: { resendApiKey: string } } | null;

        console.log("feteched credential ----> ", credential);

        if (!credential || !credential.data.resendApiKey) {
            return { success: false, error: "Bad Request" };
        }

        const resend = new ResendEmailService(credential.data.resendApiKey || "");

        const response = await resend.sendEmail({
            from: parameters.from as string,
            to: (parameters.to as string).split(","),
            subject: parameters.subject as string,
            html: parameters.html as string,
        });

        return response;
    }
}
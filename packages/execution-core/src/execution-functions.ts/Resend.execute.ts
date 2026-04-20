
import prisma from "@workspace/database"
import { ResendEmailService } from "./resend-function";
import type { NodeExecutionType } from "@workspace/types";

export const Resend: NodeExecutionType = {
    execute: async ({
        parameters,
        projectId,
        credentialId,
    }: any): Promise<{ success: boolean; data?: any; error?: string }> => {
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
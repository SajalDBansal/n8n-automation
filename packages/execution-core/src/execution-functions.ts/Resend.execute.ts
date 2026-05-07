
import prisma, { decryptCredentialData } from "@workspace/database"
import type { NodeExecutionType } from "@workspace/types";
import { ResendEmailService } from "./resend-function";

export const Resend: NodeExecutionType = {
    execute: async ({
        parameters,
        projectId,
        credentialId,
    }: any): Promise<{ success: boolean; data?: any; error?: string }> => {
        // console.log("params -------> ", { parameters, projectId, credentialId });

        if (!parameters) {
            console.error("parameters are not provided");
            return { success: false, error: "parameters are not provided" };
        }

        const missingFields = (["from", "to", "subject", "html"] as const).filter(
            (field) => typeof parameters[field] !== "string" || !(parameters[field] as string).trim()
        );

        if (missingFields.length > 0) {
            return { success: false, error: `Missing required field(s): ${missingFields.join(", ")}` };
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

        const credentialRow = await prisma.credential.findFirst({
            where: { id: credentialId, projectId: projectId },
            select: { data: true },
        });

        const credentialData = credentialRow ? decryptCredentialData<{ resendApiKey: string }>(credentialRow.data) : null;

        if (!credentialData || !credentialData.resendApiKey) {
            return { success: false, error: "Bad Request" };
        }

        const resend = new ResendEmailService(credentialData.resendApiKey || "");

        const response = await resend.sendEmail({
            from: parameters.from as string,
            to: (parameters.to as string).split(","),
            subject: parameters.subject as string,
            html: parameters.html as string,
        });

        return response;
    }
}
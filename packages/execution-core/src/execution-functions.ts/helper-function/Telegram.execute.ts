
import prisma from "@workspace/database"
import type { NodeExecutionType } from "@workspace/types";

export const Telegram: NodeExecutionType = {
    execute: async ({
        parameters,
        projectId,
        credentialId,
    }: {
        parameters: Record<string, unknown>;
        projectId: string;
        credentialId: string;
    }): Promise<{ success: boolean; data?: any; error?: string }> => {
        // console.log("params -------> ", { parameters, projectId, credentialId });

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

        // console.log("feteched credential ----> ", credential);
        const url = `https://api.telegram.org/bot${credential?.data?.accessToken}/sendMessage?chat_id=${parameters.chatId}&text=${parameters.text}`;

        const response = await fetch(url);
        const data = (await response.json()) as any;

        if (!data?.ok) {
            return { success: false, error: "Bad Request" };
        }

        // console.log(JSON.stringify(data, null, 2));

        return { success: true, data };
    }
}
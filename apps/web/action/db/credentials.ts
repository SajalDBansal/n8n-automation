import prisma from "@workspace/database";

export const getNodeCredentials = async (credentials: any, projectId: string) => {
    try {

        console.log("Fetching credentials for :", { credentials, projectId });

        if (!projectId) {
            return [];
        }

        if (!credentials || credentials.length === 0) {
            return [];
        }

        const response = await prisma.credential.findMany({
            where: {
                type: { in: credentials.map((cred: any) => cred.name) },
                projectId
            }
        })

        console.log("Fetched Credentials : ", response);
        return response;
    } catch (error) {
        console.log("Error while fetching credentials :", error);
        return [];
    }
}
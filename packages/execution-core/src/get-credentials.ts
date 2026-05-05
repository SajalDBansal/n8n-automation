import prisma, { decryptCredentialData } from "@workspace/database";

export const getCredentials = async <T>(id: string, projectId: string): Promise<T | null> => {
    const credentials = await prisma.credential.findFirst({ where: { id, projectId }, select: { data: true } });
    if (!credentials) return null;
    return decryptCredentialData<T>(credentials.data);

}
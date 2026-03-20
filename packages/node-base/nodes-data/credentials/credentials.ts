import prisma from "@workspace/database";

export const getCredentials = async <T>(id: string): Promise<T | null> => {
    const credentials = await prisma.credential.findFirst({ where: { id }, select: { data: true } });
    return credentials?.data as T | null;

}
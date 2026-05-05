import { auth } from "@/lib/auth";
import prisma, { decryptCredentialData, encryptCredentialData } from "@workspace/database";
import { updateCredentialZodSchema } from "@workspace/validators";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function getOwnedCredential(projectId: string, credentialId: string, userId: string) {
    return prisma.credential.findFirst({
        where: { id: credentialId, projectId, project: { userId } },
    });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string; credentialId: string }> }) {
    const session = await auth.api.getSession({ headers: await headers() });
    const { projectId, credentialId } = await params;

    if (!session || !session.user) {
        return NextResponse.json({ success: false, message: "Unauthorized Request" }, { status: 401 });
    }

    const credential = await getOwnedCredential(projectId, credentialId, session.user.id);

    if (!credential) {
        return NextResponse.json({ success: false, message: "Credential not found" }, { status: 404 });
    }

    // Deliberately does not return the decrypted secret data — only
    // metadata. Editing works by overwriting fields, not by round-tripping
    // the existing secret back to the browser.
    return NextResponse.json({
        success: true,
        data: {
            id: credential.id,
            name: credential.name,
            type: credential.type,
            projectId: credential.projectId,
            createdAt: credential.createdAt,
            updatedAt: credential.updatedAt,
        },
    }, { status: 200 });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ projectId: string; credentialId: string }> }) {
    const session = await auth.api.getSession({ headers: await headers() });
    const { projectId, credentialId } = await params;

    if (!session || !session.user) {
        return NextResponse.json({ success: false, message: "Unauthorized Request" }, { status: 401 });
    }

    const existing = await getOwnedCredential(projectId, credentialId, session.user.id);

    if (!existing) {
        return NextResponse.json({ success: false, message: "Credential not found" }, { status: 404 });
    }

    const body = await request.json();
    const validationResult = updateCredentialZodSchema.safeParse(body);

    if (!validationResult.success) {
        return NextResponse.json({
            success: false,
            message: "Invalid request",
            errors: validationResult.error.issues,
        }, { status: 400 });
    }

    const { name, data } = validationResult.data;

    try {
        let encryptedData: ReturnType<typeof encryptCredentialData> | undefined;

        if (data && Object.keys(data).length > 0) {
            const currentData = decryptCredentialData<Record<string, unknown>>(existing.data);
            encryptedData = encryptCredentialData({ ...currentData, ...data });
        }

        const updated = await prisma.credential.update({
            where: { id: credentialId },
            data: {
                ...(name ? { name } : {}),
                ...(encryptedData ? { data: encryptedData } : {}),
            },
        });

        return NextResponse.json({
            success: true,
            message: "Credential updated successfully",
            data: {
                id: updated.id,
                name: updated.name,
                type: updated.type,
                projectId: updated.projectId,
                updatedAt: updated.updatedAt,
            },
        }, { status: 200 });
    } catch (error) {
        console.error("Error updating credential:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ projectId: string; credentialId: string }> }) {
    const session = await auth.api.getSession({ headers: await headers() });
    const { projectId, credentialId } = await params;

    if (!session || !session.user) {
        return NextResponse.json({ success: false, message: "Unauthorized Request" }, { status: 401 });
    }

    const existing = await getOwnedCredential(projectId, credentialId, session.user.id);

    if (!existing) {
        return NextResponse.json({ success: false, message: "Credential not found" }, { status: 404 });
    }

    const nodesUsingCredential = await prisma.node.count({ where: { credentialId } });

    if (nodesUsingCredential > 0) {
        return NextResponse.json({
            success: false,
            message: `This credential is used by ${nodesUsingCredential} node${nodesUsingCredential === 1 ? "" : "s"}. Remove it from ${nodesUsingCredential === 1 ? "that node" : "those nodes"} first.`,
        }, { status: 409 });
    }

    try {
        await prisma.credential.delete({ where: { id: credentialId } });

        return NextResponse.json({
            success: true,
            message: "Credential deleted successfully",
        }, { status: 200 });
    } catch (error) {
        console.error("Error deleting credential:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}

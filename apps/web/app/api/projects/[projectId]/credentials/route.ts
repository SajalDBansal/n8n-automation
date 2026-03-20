import { authOptions } from "@/lib/auth";
import prisma from "@workspace/database";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
    const session = await getServerSession(authOptions);
    const { projectId } = await params;

    if (!session || !session.user) {
        return NextResponse.json({
            success: false,
            message: "Unauthorized Request"
        }, { status: 401 })
    }

    const userId = session.user.id;

    try {
        const isValidProject = await prisma.project.findFirst({
            where: { id: projectId, userId: userId }
        })

        if (!isValidProject) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized Request"
            }, { status: 401 })
        }

        const credentials = await prisma.credential.findMany({
            where: { projectId: projectId },
            select: { id: true, name: true, type: true, createdAt: true, updatedAt: true },
            orderBy: { updatedAt: "desc" }
        });

        const credentialsData = credentials.map(cred => ({
            ...cred,
            createdAt: cred.createdAt.toISOString(),
            updatedAt: cred.updatedAt.toISOString()
        }));

        return NextResponse.json({
            success: true,
            message: "Workflow added successfully",
            credentials: credentialsData
        }, { status: 200 })

    } catch (error) {
        console.error("Error creating workflow : ", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
        }, { status: 500 })
    }

}
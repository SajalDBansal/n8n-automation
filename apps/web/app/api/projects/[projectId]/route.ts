import { authOptions } from "@/lib/auth";
import prisma from "@workspace/database";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
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
        const deleted = await prisma.project.deleteMany({
            where: {
                id: projectId,
                userId,
                workflows: {
                    none: {} // ensures 0 workflows
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: "Projects deleted successfully",
        }, { status: 200 })

    } catch (error) {
        console.error("Error in deleting project : ", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
        }, { status: 500 })
    }
}
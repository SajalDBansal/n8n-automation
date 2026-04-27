import { authOptions } from "@/lib/auth";
import prisma from "@workspace/database";
import { updateProjectZodSchema } from "@workspace/validators";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
    const session = await getServerSession(authOptions);
    const { projectId } = await params;
    const url = new URL(request.url);
    const force = url.searchParams.get("force");

    if (!session || !session.user) {
        return NextResponse.json({
            success: false,
            message: "Unauthorized Request"
        }, { status: 401 })
    }

    const userId = session.user.id;

    try {

        if (force) {
            await prisma.project.delete({
                where: {
                    id: projectId,
                    userId,
                }
            });
        } else {
            await prisma.project.delete({
                where: {
                    id: projectId,
                    userId,
                    workflows: {
                        none: {} // ensures 0 workflows
                    }
                }
            });
        }

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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
    const session = await getServerSession(authOptions);
    const { projectId } = await params;
    const body = await request.json();

    if (!session || !session.user) {
        return NextResponse.json({
            success: false,
            message: "Unauthorized Request"
        }, { status: 401 })
    }

    const userId = session.user.id;

    const validateData = updateProjectZodSchema.safeParse(body);

    if (!validateData.success) {
        return NextResponse.json({
            success: false,
            message: "Validation Error",
            error: validateData.error.message
        }, { status: 400 })
    }

    try {
        const project = await prisma.project.update({
            where: { id: projectId, userId: userId },
            data: validateData.data
        });

        if (!project) {
            const isProjectExists = await prisma.project.findUnique({
                where: { id: projectId, userId: userId }
            });

            if (!isProjectExists) {
                return NextResponse.json({
                    success: false,
                    message: "Unauthorized Request"
                }, { status: 401 })
            }
        }

        return NextResponse.json({
            success: true,
            message: "Projects deleted successfully",
            project
        }, { status: 200 })

    } catch (error) {
        console.error("Error in deleting project : ", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
        }, { status: 500 })
    }
}
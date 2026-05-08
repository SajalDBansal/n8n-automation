import { auth } from "@/lib/auth";
import prisma from "@workspace/database";
import { updateProjectZodSchema } from "@workspace/validators";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
    const session = await auth.api.getSession({ headers: await headers() });
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
            message: "Project deleted successfully",
        }, { status: 200 })

    } catch (error) {
        if ((error as { code?: string })?.code === "P2025") {
            return NextResponse.json({
                success: false,
                message: "Project not found",
            }, { status: 404 })
        }
        console.error("Error in deleting project : ", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
        }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
    const session = await auth.api.getSession({ headers: await headers() });
    const { projectId } = await params;

    if (!session || !session.user) {
        return NextResponse.json({
            success: false,
            message: "Unauthorized Request"
        }, { status: 401 })
    }

    const userId = session.user.id;

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({
            success: false,
            message: "Invalid JSON body",
        }, { status: 400 })
    }

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

        return NextResponse.json({
            success: true,
            message: "Project updated successfully",
            project
        }, { status: 200 })

    } catch (error) {
        // Prisma throws P2025 rather than returning null when the compound
        // where clause doesn't match (wrong id, or a different user's
        // project) — there's no reachable "found but somehow null" case.
        if ((error as { code?: string })?.code === "P2025") {
            return NextResponse.json({
                success: false,
                message: "Project not found",
            }, { status: 404 })
        }
        console.error("Error updating project : ", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
        }, { status: 500 })
    }
}
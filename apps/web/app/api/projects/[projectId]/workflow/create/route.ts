import { authOptions } from "@/lib/auth";
import prisma from "@workspace/database";
import { createWorkflowZodSchema } from "@workspace/validators";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
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

    const validateData = createWorkflowZodSchema.safeParse(body);

    if (!validateData.success) {
        return NextResponse.json({
            success: false,
            message: "Validation Error",
            error: validateData.error.message
        }, { status: 400 })
    }

    const data = validateData.data;

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

        const workflow = await prisma.workflow.create({
            data: {
                projectId: projectId,
                id: data.id,
                name: data.name,
                description: data.description
            }
        })


        return NextResponse.json({
            success: true,
            message: "Workflow added successfully",
            workflow
        }, { status: 200 })

    } catch (error) {
        console.error("Error creating workflow : ", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
        }, { status: 500 })
    }
}
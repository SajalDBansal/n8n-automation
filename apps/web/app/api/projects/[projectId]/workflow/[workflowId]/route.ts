import { authOptions } from "@/lib/auth";
import prisma from "@workspace/database";
import { updateWorkflowZodSchema } from "@workspace/validators";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ workflowId: string }> }) {
    const session = await getServerSession(authOptions);
    const { workflowId } = await params;

    if (!session || !session.user) {
        return NextResponse.json({
            success: false,
            message: "Unauthorized Request"
        }, { status: 401 })
    }

    try {
        await prisma.workflow.delete({ where: { id: workflowId } });


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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ workflowId: string }> }) {
    const session = await getServerSession(authOptions);
    const { workflowId } = await params;
    const body = await request.json();

    if (!session || !session.user) {
        return NextResponse.json({
            success: false,
            message: "Unauthorized Request"
        }, { status: 401 })
    }

    const validateData = updateWorkflowZodSchema.safeParse(body);

    if (!validateData.success) {
        return NextResponse.json({
            success: false,
            message: "Unauthorized Request"
        }, { status: 401 })
    }

    const data = validateData.data;

    if (data.id !== workflowId) {
        return NextResponse.json({
            success: false,
            message: "Unauthorized Request"
        }, { status: 401 })
    }

    try {
        await prisma.workflow.update({
            where: { id: workflowId },
            data: {
                name: data.name,
                description: data.description
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
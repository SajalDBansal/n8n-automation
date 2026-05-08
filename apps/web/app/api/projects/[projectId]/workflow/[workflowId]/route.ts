import { auth } from "@/lib/auth";
import prisma from "@workspace/database";
import { updateWorkflowZodSchema } from "@workspace/validators";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ workflowId: string }> }) {
    const session = await auth.api.getSession({ headers: await headers() });
    const { workflowId } = await params;

    if (!session || !session.user) {
        return NextResponse.json({
            success: false,
            message: "Unauthorized Request"
        }, { status: 401 })
    }

    try {
        const workflow = await prisma.workflow.findFirst({
            where: { id: workflowId, project: { userId: session.user.id } },
            include: {
                nodes: true,
                edges: true
            }
        });

        if (!workflow) {
            return NextResponse.json({
                success: false,
                message: "Workflow not found"
            }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: "Workflow fetched successfully",
            data: workflow
        }, { status: 200 })
    } catch (error) {
        console.error("Error in fetching workflow : ", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
        }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ workflowId: string }> }) {
    const session = await auth.api.getSession({ headers: await headers() });
    const { workflowId } = await params;

    if (!session || !session.user) {
        return NextResponse.json({
            success: false,
            message: "Unauthorized Request"
        }, { status: 401 })
    }

    try {
        const owned = await prisma.workflow.findFirst({
            where: { id: workflowId, project: { userId: session.user.id } },
            select: { id: true }
        });

        if (!owned) {
            return NextResponse.json({
                success: false,
                message: "Workflow not found"
            }, { status: 404 })
        }

        await prisma.workflow.delete({ where: { id: workflowId } });


        return NextResponse.json({
            success: true,
            message: "Workflow deleted successfully",
        }, { status: 200 })

    } catch (error) {
        console.error("Error in deleting workflow : ", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
        }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ workflowId: string }> }) {
    const session = await auth.api.getSession({ headers: await headers() });
    const { workflowId } = await params;

    if (!session || !session.user) {
        return NextResponse.json({
            success: false,
            message: "Unauthorized Request"
        }, { status: 401 })
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({
            success: false,
            message: "Invalid JSON body",
        }, { status: 400 })
    }

    const validateData = updateWorkflowZodSchema.safeParse(body);

    if (!validateData.success) {
        return NextResponse.json({
            success: false,
            message: "Validation Error",
            error: validateData.error.message
        }, { status: 400 })
    }

    const data = validateData.data;

    if (data.id !== workflowId) {
        return NextResponse.json({
            success: false,
            message: "Workflow ID mismatch"
        }, { status: 400 })
    }

    try {
        const owned = await prisma.workflow.findFirst({
            where: { id: workflowId, project: { userId: session.user.id } },
            select: { id: true }
        });

        if (!owned) {
            return NextResponse.json({
                success: false,
                message: "Workflow not found"
            }, { status: 404 })
        }

        await prisma.workflow.update({
            where: { id: workflowId },
            data: {
                name: data.name,
                description: data.description
            }
        });

        return NextResponse.json({
            success: true,
            message: "Workflow updated successfully",
        }, { status: 200 })

    } catch (error) {
        console.error("Error in updating workflow : ", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
        }, { status: 500 })
    }
}
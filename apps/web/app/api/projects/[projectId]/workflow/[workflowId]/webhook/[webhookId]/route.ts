import { getExecutionEngine } from "@/lib/execution/execution-engine";
import prisma from "@workspace/database";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
    req: NextRequest,
    { params }: { params: Promise<{ webhookId: string, projectId: string }> }
) => {
    console.log("-------------webhook------------------------");
    const webhookId = (await params).webhookId;
    const projectId = (await params).projectId;
    console.log("webhookId", webhookId);

    const workflow = await prisma.webhook.findFirst({
        where: {
            id: webhookId,
        },
        select: {
            workflowId: true,
        },
    });
    const workflowId = workflow?.workflowId || null;

    if (!workflowId)
        return NextResponse.json(
            {
                error: `The requested webhook ${webhookId} is not registered.`,
            },
            { status: 404 }
        );

    const executionResponse = await prisma.$transaction(async (tx) => {
        const workflow = await tx.workflow.findUnique({
            where: { id: workflowId },
            include: { nodes: true, edges: true },
        });

        const response = await tx.execution.create({
            data: {
                workflowId,
                data: {
                    nodes: workflow?.nodes || [],
                    edges: workflow?.edges || [],
                },
                status: "STARTING",
            },
            select: {
                id: true,
            },
        });
        return response;
    });
    const executionId = executionResponse.id;
    console.log("ExecutingID", executionId);

    const executionEngine = getExecutionEngine();
    try {
        await executionEngine.execute({
            workflowId,
            executionId,
            projectId
        });
    } catch (error) {
        console.error("Failed to dispatch webhook execution:", error);
        return NextResponse.json(
            {
                error: "Failed to dispatch workflow execution",
            },
            { status: 500 }
        );
    }

    return NextResponse.json(
        {
            message: "workflow started",
        },
        { status: 200 }
    );
};

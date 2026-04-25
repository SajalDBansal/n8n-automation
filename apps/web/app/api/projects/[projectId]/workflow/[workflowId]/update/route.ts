import { authOptions } from "@/lib/auth";
import prisma from "@workspace/database";
import { updateWorkflowDataZodSchema } from "@workspace/validators";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ workflowId: string, projectId: string }> }) {
    const session = await getServerSession(authOptions);
    const { workflowId, projectId } = await params;
    const body = await request.json();

    if (!session || !session.user) {
        return NextResponse.json({
            success: false,
            message: "Unauthorized Request"
        }, { status: 401 })
    }

    const validationResult = updateWorkflowDataZodSchema.safeParse(body);

    if (!validationResult.success) {
        return NextResponse.json({
            success: false,
            message: "Invalid request data",
            errors: validationResult.error.issues
        }, { status: 400 })
    }

    const { name, active, nodes, edges, projectId: projectIdFromClient } = validationResult.data;

    try {

        const isWorkflowExists = await prisma.workflow.findFirst({
            where: {
                id: workflowId,
                projectId: projectId,
                project: {
                    userId: session.user.id
                }
            },
            select: {
                id: true,
                name: true,
                active: true,
                projectId: true,
            }
        });

        if (!isWorkflowExists) {
            return NextResponse.json({
                success: false,
                message: "Workflow not found",
            }, { status: 404 });
        }

        await prisma.$transaction(async (tx) => {

            await tx.edge.deleteMany({ where: { workflowId: workflowId } });
            await tx.node.deleteMany({ where: { workflowId: workflowId } });
            await tx.webhook.deleteMany({ where: { workflowId } });

            await tx.workflow.update({
                where: { id: workflowId },
                data: { name, active }
            })

            if (nodes.length === 0 && edges.length === 0) {
                return NextResponse.json({
                    success: true,
                    message: "Workflow Cleared successfully",
                }, { status: 200 })
            }

            const webhookNode = nodes.filter((node) => node.type === "WEBHOOK");

            if (webhookNode.length > 1) {
                return NextResponse.json({
                    success: false,
                    message: "Only one webhook node is allowed",
                }, { status: 400 });
            }

            await tx.node.createMany({
                data: nodes.map((node) => ({
                    id: node.id,
                    workflowId: workflowId,
                    type: node.type,
                    description: node.description,
                    parameters: node.parameters || {},
                    positionX: node.positionX,
                    positionY: node.positionY,
                    name: node.name,
                    data: node.data || {},
                    credentialId: node.credentialId || null
                })),
            });

            await tx.edge.createMany({
                data: edges.map((edge) => ({
                    workflowId: workflowId,
                    source: edge.source,
                    target: edge.target,
                    sourceHandle: edge.sourceHandle,
                    targetHandle: edge.targetHandle,
                })),
            });

            if (webhookNode.length === 1) {
                const webhook = webhookNode[0];
                if (!webhook || !webhook.id) {
                    return NextResponse.json({
                        success: false,
                        message: "Webhook node ID is required",
                    }, { status: 400 });
                }
                const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/projects/${projectId}/workflow/${workflowId}/webhook/${webhook.id}`;
                await tx.webhook.create({
                    data: {
                        id: webhook.id,
                        url: webhookUrl,
                        workflowId: workflowId,

                    }
                })
            }
        }, {
            maxWait: 10000, // wait up to 10s for a transaction slot
            timeout: 20000, // transaction lifetime = 20s
        });

        return NextResponse.json({
            success: true,
            message: "Workflow Updates successfully",
        }, { status: 200 })

    } catch (error) {
        console.log(error);

        return NextResponse.json({
            success: false,
            message: "Failed to update workflow",
        }, { status: 500 })
    }
}
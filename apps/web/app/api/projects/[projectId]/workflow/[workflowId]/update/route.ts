import { auth } from "@/lib/auth";
import prisma from "@workspace/database";
import { updateWorkflowDataZodSchema } from "@workspace/validators";
import { randomBytes } from "crypto";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import publicConfig from "@/utils/public-config";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ workflowId: string, projectId: string }> }) {
    const session = await auth.api.getSession({ headers: await headers() });
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

    const { name, active, nodes, edges, projectId: projectIdFromClient, expectedUpdatedAt } = validationResult.data;

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
                updatedAt: true,
            }
        });

        if (!isWorkflowExists) {
            return NextResponse.json({
                success: false,
                message: "Workflow not found",
            }, { status: 404 });
        }

        // Optimistic concurrency: the editor sends back the `updatedAt` it
        // last loaded. If the row has moved on since (another tab, another
        // device), refuse the overwrite instead of silently clobbering it.
        if (expectedUpdatedAt && isWorkflowExists.updatedAt.toISOString() !== expectedUpdatedAt) {
            return NextResponse.json({
                success: false,
                message: "This workflow was changed elsewhere since you loaded it. Reload the page to see the latest version before saving.",
            }, { status: 409 });
        }

        const updatedFlow = await prisma.$transaction(async (tx) => {

            await tx.edge.deleteMany({ where: { workflowId: workflowId } });
            await tx.node.deleteMany({ where: { workflowId: workflowId } });

            await tx.workflow.update({
                where: { id: workflowId },
                data: { name, active }
            })

            if (nodes.length === 0 && edges.length === 0) {
                await tx.webhook.deleteMany({ where: { workflowId } });
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

            // Preserve the webhook's HMAC secret across saves — deleting and
            // recreating the row on every save (the old behavior) would
            // silently invalidate the signing secret every time the
            // workflow was saved. Only remove webhook rows that no longer
            // correspond to a node in this save; upsert the current one so
            // an existing `secret` survives.
            const keepWebhookId = webhookNode.length === 1 ? webhookNode[0]?.id ?? null : null;
            await tx.webhook.deleteMany({
                where: {
                    workflowId,
                    ...(keepWebhookId ? { id: { not: keepWebhookId } } : {}),
                },
            });

            if (webhookNode.length === 1) {
                const webhook = webhookNode[0];
                if (!webhook || !webhook.id) {
                    return NextResponse.json({
                        success: false,
                        message: "Webhook node ID is required",
                    }, { status: 400 });
                }
                const webhookUrl = `${publicConfig.NEXT_PUBLIC_APP_URL}/api/projects/${projectId}/workflow/${workflowId}/webhook/${webhook.id}`;
                await tx.webhook.upsert({
                    where: { id: webhook.id },
                    create: {
                        id: webhook.id,
                        url: webhookUrl,
                        workflowId: workflowId,
                        secret: randomBytes(32).toString("hex"),
                    },
                    update: {
                        url: webhookUrl,
                    },
                })
            }

            // Must read via `tx`, not the outer `prisma` client — the writes
            // above haven't committed yet at this point, so a read through
            // the outer client (a separate DB session) was returning the
            // pre-update row every time (stale `active` value, empty
            // nodes/edges), even though the transaction itself committed
            // correctly.
            const updatedWorkflow = await tx.workflow.findFirst({
                where: { id: workflowId },
                include: { nodes: true, edges: true }
            })

            return updatedWorkflow;
        }, {
            maxWait: 10000, // wait up to 10s for a transaction slot
            timeout: 20000, // transaction lifetime = 20s
        });

        return NextResponse.json({
            success: true,
            message: "Workflow Updates successfully",
            workflow: updatedFlow
        }, { status: 200 })

    } catch (error) {
        console.error("Error updating workflow:", error);

        return NextResponse.json({
            success: false,
            message: "Failed to update workflow",
        }, { status: 500 })
    }
}
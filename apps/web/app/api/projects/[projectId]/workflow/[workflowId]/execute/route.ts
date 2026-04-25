import { authOptions } from "@/lib/auth";
import prisma from "@workspace/database";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { getSubscriber } from "@/lib/redis-manager";
import { getExecutionEngine, isWorkerModeEnabled } from "@/lib/execution/execution-engine";
import { subscribeExecutionEvents } from "@/lib/execution/evevt-emitter";
import { PublishPayloadDataType } from "@workspace/types";

export const GET = async (req: NextRequest, { params }: { params: Promise<{ workflowId: string, projectId: string }> }) => {
    const { workflowId, projectId } = await params;
    // console.log("Received request to execute workflow");
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
            });
        }

        if (!workflowId) {
            return new Response(JSON.stringify({ error: "workflowId is required" }), {
                status: 400,
            });
        }

        const encoder = new TextEncoder();
        const workersEnabled = isWorkerModeEnabled();

        const stream = new ReadableStream({
            async start(controller) {
                const subscriber = workersEnabled ? await getSubscriber() : null;
                const executionEngine = getExecutionEngine();
                let channel: string | null = null;
                let unsubscribeInMemory: (() => void) | null = null;

                try {
                    let isClosed = false;
                    const safeClose = () => {
                        if (isClosed) return;
                        isClosed = true;
                        try {
                            controller.close();
                        } catch (e) {
                            if (
                                !(e instanceof TypeError) ||
                                !String(e.message).includes("Controller is already closed")
                            ) {
                                console.error("Error closing stream controller:", e);
                            }
                        }
                    };

                    const cleanup = async () => {
                        try {
                            if (workersEnabled && channel && subscriber?.isOpen) {
                                await subscriber.unsubscribe(channel);
                            }
                            if (!workersEnabled && unsubscribeInMemory) {
                                unsubscribeInMemory();
                                unsubscribeInMemory = null;
                            }
                        } catch (err) {
                            console.error("Error cleaning execution subscription:", err);
                        }
                    };

                    const executionResponse = await prisma.$transaction(async (tx) => {
                        const workflow = await tx.workflow.findFirst({
                            where: {
                                id: workflowId,
                                project: {
                                    userId: session.user.id,
                                },
                            },
                            include: { nodes: true, edges: true },
                        });

                        if (!workflow) {
                            throw new Error("Workflow not found or access denied");
                        }

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
                    // console.log("ExecutingID", executionId);

                    channel = `execution-${executionId}`;

                    const onExecutionMessage = async (message: string) => {
                        try {
                            const parsedMessage: PublishPayloadDataType = JSON.parse(message);

                            const isErrorState =
                                parsedMessage.status === "ERROR" ||
                                parsedMessage.status === "CANCELLED" ||
                                parsedMessage.status === "CRASHED";

                            const enhancedPayload = {
                                ...parsedMessage,
                                ui: {
                                    showPopup: isErrorState,
                                    type: parsedMessage.status, // for styling (error, warning, etc.)
                                },
                            };

                            const eventType = isErrorState ? "workflow-error" : "workflow-update";

                            if (!isClosed) {
                                controller.enqueue(
                                    encoder.encode(`event: ${eventType}\ndata: ${JSON.stringify(enhancedPayload)}\n\n`)
                                );
                            }

                            const isTerminal = parsedMessage.status === "SUCCESS" || isErrorState;

                            if (isTerminal) {
                                console.log(`Workflow ${executionId} finished with status: ${parsedMessage.status}`);

                                setTimeout(async () => {
                                    await cleanup();
                                    safeClose();
                                }, 1000);
                            }
                        } catch (err) {
                            console.error("Error processing message:", err);
                        }
                    };

                    if (workersEnabled && subscriber) {
                        // console.log(`Subscribing to redis channel: ${channel}`);
                        await subscriber.subscribe(channel, onExecutionMessage);
                    } else {
                        // console.log(`Subscribing to in-memory channel: ${channel}`);
                        unsubscribeInMemory = subscribeExecutionEvents(
                            executionId,
                            onExecutionMessage
                        );
                    }

                    // await new Promise((resolve) => setTimeout(resolve, 100));

                    // console.log(`Dispatching execution ${executionId} (workersEnabled=${workersEnabled})`);
                    await executionEngine.execute({
                        workflowId,
                        executionId,
                        projectId
                    });

                    req.signal.addEventListener("abort", async () => {
                        // console.log(`Client disconnected for execution ${executionId}`);
                        await cleanup();
                        safeClose();
                    });

                } catch (error) {
                    console.error("Error in stream start:", error);
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({ error: "Internal Server Error" })}\n\n`
                        )
                    );
                    if (workersEnabled && channel && subscriber?.isOpen) {
                        await subscriber.unsubscribe(channel);
                    }
                    if (!workersEnabled && unsubscribeInMemory) {
                        unsubscribeInMemory();
                    }
                    try {
                        controller.close();
                    } catch (closeError) {
                        if (
                            !(closeError instanceof TypeError) ||
                            !String(closeError.message).includes("Controller is already closed")
                        ) {
                            console.error("Error closing stream controller:", closeError);
                        }
                    }
                }
            },
        });

        // console.log(stream);


        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache, no-transform",
                Connection: "keep-alive",
                "X-Accel-Buffering": "no",
            },
        });
    } catch (error) {
        console.error("Error in workflow execution route:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
        });
    }
};

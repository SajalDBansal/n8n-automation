import { getExecutionEngine } from "@/lib/execution/execution-engine";
import { logger } from "@/lib/logger";
import { isWebhookRateLimited } from "@/lib/webhook-rate-limit";
import prisma from "@workspace/database";
import { updateExecutionStatusInDB } from "@workspace/execution-core";
import type { WebhookTriggerPayload } from "@workspace/types";
import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const verifySignature = (rawBody: string, secret: string, signatureHeader: string | null): boolean => {
    if (!signatureHeader) return false;

    const provided = signatureHeader.startsWith("sha256=") ? signatureHeader.slice(7) : signatureHeader;
    const expected = createHmac("sha256", secret).update(rawBody).digest("hex");

    const providedBuf = Buffer.from(provided, "hex");
    const expectedBuf = Buffer.from(expected, "hex");

    if (providedBuf.length !== expectedBuf.length) return false;
    return timingSafeEqual(providedBuf, expectedBuf);
};

const handleWebhookTrigger = async (
    req: NextRequest,
    { params }: { params: Promise<{ webhookId: string; projectId: string; workflowId: string }> }
) => {
    const { webhookId, projectId, workflowId: routeWorkflowId } = await params;

    try {
        if (isWebhookRateLimited(webhookId)) {
            return NextResponse.json(
                { success: false, message: "Too many requests to this webhook. Try again shortly." },
                { status: 429 }
            );
        }

        const webhook = await prisma.webhook.findFirst({
            where: { id: webhookId },
            select: { workflowId: true, secret: true },
        });
        const workflowId = webhook?.workflowId || null;

        if (!workflowId || workflowId !== routeWorkflowId) {
            return NextResponse.json(
                { success: false, message: `The requested webhook ${webhookId} is not registered.` },
                { status: 404 }
            );
        }

        // A deactivated workflow shouldn't be externally triggerable.
        const workflowStatus = await prisma.workflow.findFirst({
            where: { id: workflowId, projectId },
            select: { active: true },
        });

        if (!workflowStatus?.active) {
            return NextResponse.json(
                { success: false, message: "This workflow is not active." },
                { status: 404 }
            );
        }

        // Read the body as raw text first — HMAC verification needs the
        // exact bytes the caller signed, not a re-serialized JSON.parse
        // round-trip.
        let rawBody = "";
        const contentLength = req.headers.get("content-length");
        if (req.method !== "GET" && req.method !== "HEAD" && contentLength && contentLength !== "0") {
            try {
                rawBody = await req.text();
            } catch {
                rawBody = "";
            }
        }

        // Once a webhook has a secret (generated on creation, or lazily the
        // first time its docs panel is viewed), a valid signature becomes
        // mandatory. Webhooks that predate signing (secret still null) stay
        // unsigned until that first view.
        if (webhook!.secret) {
            const signatureValid = verifySignature(rawBody, webhook!.secret, req.headers.get("x-webhook-signature"));
            if (!signatureValid) {
                return NextResponse.json(
                    { success: false, message: "Invalid or missing webhook signature." },
                    { status: 401 }
                );
            }
        }

        // A HEAD probe confirms the endpoint exists and is active without
        // actually triggering a run.
        if (req.method === "HEAD") {
            return new NextResponse(null, { status: 200 });
        }

        let body: unknown = null;
        if (rawBody) {
            try {
                body = JSON.parse(rawBody);
            } catch {
                body = rawBody;
            }
        }

        const query: Record<string, string> = {};
        req.nextUrl.searchParams.forEach((value, key) => {
            query[key] = value;
        });

        const headers: Record<string, string> = {};
        req.headers.forEach((value, key) => {
            headers[key] = value;
        });

        const triggerPayload: WebhookTriggerPayload = {
            method: req.method,
            headers,
            query,
            body,
        };

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
                        // Normalized to a plain JSON value for the Prisma Json
                        // column — the body can be arbitrary caller-supplied data.
                        triggerPayload: JSON.parse(JSON.stringify(triggerPayload)),
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

        const executionEngine = getExecutionEngine();
        try {
            await executionEngine.execute({
                workflowId,
                executionId,
                projectId
            });
        } catch (error) {
            logger.error("Failed to dispatch webhook execution", error, { executionId, workflowId, webhookId });
            // Otherwise this row is orphaned at STARTING forever — nothing
            // downstream of a dispatch failure ever touches it again.
            await updateExecutionStatusInDB(executionId, "ERROR", true);
            return NextResponse.json(
                { success: false, message: "Failed to dispatch workflow execution" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true, message: "Workflow started", executionId },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error handling webhook trigger:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
};

export const GET = handleWebhookTrigger;
export const POST = handleWebhookTrigger;
export const PUT = handleWebhookTrigger;
export const PATCH = handleWebhookTrigger;
export const DELETE = handleWebhookTrigger;
export const HEAD = handleWebhookTrigger;

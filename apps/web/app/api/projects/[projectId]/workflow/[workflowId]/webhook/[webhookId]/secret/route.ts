import { auth } from "@/lib/auth";
import prisma from "@workspace/database";
import { randomBytes } from "crypto";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Authenticated-only — returns the signing secret for a webhook so the
// editor's docs panel can show it to the workflow's owner. Distinct from
// the public trigger route at the parent path, which handles every HTTP
// method for external callers.
export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string, workflowId: string, webhookId: string }> }) {
    const session = await auth.api.getSession({ headers: await headers() });
    const { projectId, workflowId, webhookId } = await params;

    if (!session || !session.user) {
        return NextResponse.json({
            success: false,
            message: "Unauthorized Request"
        }, { status: 401 })
    }

    try {
        const webhook = await prisma.webhook.findFirst({
            where: {
                id: webhookId,
                workflowId,
                workflow: { projectId, project: { userId: session.user.id } },
            },
            select: { id: true, secret: true },
        });

        if (!webhook) {
            return NextResponse.json({
                success: false,
                message: "Webhook not found",
            }, { status: 404 });
        }

        // Lazily secure webhooks created before signature validation
        // existed — the first time an owner views this panel, generate and
        // persist a secret so signing becomes enforced going forward.
        let secret = webhook.secret;
        if (!secret) {
            secret = randomBytes(32).toString("hex");
            await prisma.webhook.update({
                where: { id: webhook.id },
                data: { secret },
            });
        }

        return NextResponse.json({
            success: true,
            secret,
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching webhook secret:", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
        }, { status: 500 });
    }
}

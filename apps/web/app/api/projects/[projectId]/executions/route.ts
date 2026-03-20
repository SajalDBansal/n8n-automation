import { authOptions } from "@/lib/auth";
import prisma from "@workspace/database";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
    const session = await getServerSession(authOptions);
    const { projectId } = await params;

    if (!session || !session.user) {
        return NextResponse.json({
            success: false,
            message: "Unauthorized Request"
        }, { status: 401 })
    }

    const userId = session.user.id;

    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
        const status = url.searchParams.get("status");
        const workflowId = url.searchParams.get("workflowId");
        const skip = (page - 1) * limit;

        const whereCondition: any = {
            workflow: { is: { projectId: projectId, project: { is: { userId: userId } } } },
        };

        if (status) whereCondition.status = status;
        if (workflowId) whereCondition.workflowId = workflowId;

        const [executions, totalExecutionsCount] = await Promise.all([
            prisma.execution.findMany({
                where: whereCondition,
                include: {
                    workflow: {
                        select: {
                            id: true, name: true,
                            project: { select: { id: true, name: true } }
                        }
                    }
                },
                orderBy: { createdAt: "desc" },
                skip, take: limit
            }),

            prisma.execution.count({ where: whereCondition })
        ]);

        if (executions.length === 0) {
            const isProjectExists = await prisma.project.findUnique({ where: { id: projectId, userId }, select: { id: true } });
            if (!isProjectExists) {
                return NextResponse.json({
                    success: false,
                    message: "Project not found",
                    error: "Project not found"
                }, { status: 401 })
            }
        }

        const transformedExecutions = executions.map((exec) => ({
            id: exec.id,
            workflowId: exec.workflowId,
            workflowName: exec.workflow.name || "Unknown Execution",
            status: exec.status,
            isFinished: exec.isFinished,
            startedAt: exec.startedAt,
            createdAt: exec.createdAt,
            stoppedAt: exec.stoppedAt,
            runtimeMs: calculateRuntime(exec.startedAt, exec.stoppedAt),
            runtimeFormatted: formatRuntime(calculateRuntime(exec.startedAt, exec.stoppedAt))
        }))

        return NextResponse.json({
            success: true,
            message: "Execution list fetched successfully",
            executions: transformedExecutions,
            pagination: {
                page,
                limit,
                total: totalExecutionsCount,
                totalPages: Math.ceil(totalExecutionsCount / limit),
                hasMore: skip + executions.length < totalExecutionsCount
            }, filter: {
                status, workflowId
            }
        }, { status: 200 })

    } catch (error) {
        console.error("Error fetching project executions:", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
        }, { status: 500 })
    }

}

function calculateRuntime(
    startedAt: Date | null,
    stoppedAt: Date | null
): number {
    if (!startedAt) return 0;

    if (stoppedAt) {
        return stoppedAt.getTime() - startedAt.getTime();
    }

    return Date.now() - startedAt.getTime();
}

function formatRuntime(ms: number): string {
    if (ms < 1000) {
        return `${Math.round(ms)}ms`;
    }

    const seconds = ms / 1000;
    if (seconds < 60) {
        return `${seconds.toFixed(3)}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
}

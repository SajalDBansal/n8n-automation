"use server";
import prisma from "@workspace/database";
import { CredentialsPageReturnType, ExecutionStatusDataType, OverviewStatsPageDataType, ProjectOverviewStatsPageDataType, ProjectType } from "@workspace/types";
import { auth } from "./auth";
import { headers } from "next/headers";

export const getProjectOverviewStats = async (projectId: string): Promise<ProjectOverviewStatsPageDataType> => {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
        throw new Error("User session not found");
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    try {
        const [
            projectDetails,
            totalWorkflows,
            totalExecutionsToday,
            activeCredentials,
            failedExecutionToday
        ] = await Promise.all([

            prisma.project.findFirst({
                where: { id: projectId, userId: session.user.id },
                select: { name: true, description: true, createdAt: true, type: true }
            }),

            // 1. Total workflows
            prisma.workflow.count({
                where: {
                    projectId,
                }
            }),

            // 2. Total executions today
            prisma.execution.count({
                where: {
                    workflow: {
                        projectId
                    },
                    createdAt: {
                        gte: startOfDay
                    }
                }
            }),

            // 3. Active credentials
            prisma.credential.count({
                where: {
                    projectId
                }
            }),

            // 4. Failed executions today
            prisma.execution.count({
                where: {
                    workflow: {
                        projectId
                    },
                    createdAt: {
                        gte: startOfDay
                    },
                    status: {
                        in: ['ERROR', 'CRASHED']
                    }
                }
            })
        ]);

        const details = {
            name: projectDetails?.name,
            description: projectDetails?.description ? projectDetails.description : undefined,
            type: projectDetails?.type,
            createdAt: projectDetails?.createdAt.toISOString(),
        }

        return {
            projectDetails: details,
            totalWorkflows,
            totalExecutionsToday,
            activeCredentials,
            failedExecutionToday
        }
    } catch (error) {
        console.error("Error occured while fetching :", error);
        return {
            projectDetails: {
                name: "Undefined",
                description: "NA",
                type: "PERSONAL",
                createdAt: "NA"
            },
            totalWorkflows: 0,
            totalExecutionsToday: 0,
            activeCredentials: 0,
            failedExecutionToday: 0,
        }

    }
}

export const getWorkflowById = async (projectId: string, workflowId: string) => {
    try {
        const session = await auth.api.getSession({ headers: await headers() });

        if (!session || !session.user) {
            throw new Error("User session not found");
        }

        const [workflow, executionCount] = await Promise.all([
            await prisma.workflow.findFirst({
                where: { id: workflowId, projectId: projectId, project: { userId: session.user.id } }
            }),
            await prisma.execution.count({ where: { workflowId: workflowId } })
        ])



        if (!workflow) { return null }

        return { workflow, executionCount };

    } catch (error) {
        console.error("Error fetching workflow : ", error);
        return null;
    }
}

export type RecentExecutionRow = {
    id: string;
    workflowId: string;
    workflowName: string;
    projectId: string;
    projectName: string;
    status: string;
    createdAt: string;
};

export const getDashboardOverviewStats = async (): Promise<OverviewStatsPageDataType> => {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
        throw new Error("User session not found");
    }

    const userId = session.user.id;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    try {
        const [activeProjects, totalWorkflows, totalExecutionsToday, failedExecutionToday] = await Promise.all([
            prisma.project.count({ where: { userId } }),

            prisma.workflow.count({ where: { project: { userId } } }),

            prisma.execution.count({
                where: {
                    workflow: { project: { userId } },
                    createdAt: { gte: startOfDay },
                },
            }),

            prisma.execution.count({
                where: {
                    workflow: { project: { userId } },
                    createdAt: { gte: startOfDay },
                    status: { in: ["ERROR", "CRASHED"] },
                },
            }),
        ]);

        return { activeProjects, totalWorkflows, totalExecutionsToday, failedExecutionToday };
    } catch (error) {
        console.error("Error fetching dashboard overview stats:", error);
        return { activeProjects: 0, totalWorkflows: 0, totalExecutionsToday: 0, failedExecutionToday: 0 };
    }
};

export const getRecentExecutions = async (limit: number = 5): Promise<RecentExecutionRow[]> => {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
        throw new Error("User session not found");
    }

    try {
        const executions = await prisma.execution.findMany({
            where: { workflow: { project: { userId: session.user.id } } },
            include: {
                workflow: {
                    select: {
                        id: true,
                        name: true,
                        project: { select: { id: true, name: true } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: limit,
        });

        return executions.map((execution) => ({
            id: execution.id,
            workflowId: execution.workflow.id,
            workflowName: execution.workflow.name,
            projectId: execution.workflow.project.id,
            projectName: execution.workflow.project.name,
            status: execution.status,
            createdAt: execution.createdAt.toISOString(),
        }));
    } catch (error) {
        console.error("Error fetching recent executions:", error);
        return [];
    }
};

export const getAllCredentials = async (userId: string): Promise<CredentialsPageReturnType[] | null> => {
    try {
        const projectWithCredentials = await prisma.project.findMany({
            where: { userId: userId, credentials: { some: {} } },
            select: {
                id: true,
                name: true,
                type: true,
                icon: true,
                description: true,
                credentials: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        createdAt: true,
                        updatedAt: true
                    }
                }
            }
        })

        return projectWithCredentials;

    } catch (error) {
        console.error("Error fetching workflow : ", error);
        return null;
    }
}

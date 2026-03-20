"use server";
import prisma from "@workspace/database";
import { CredentialsPageReturnType, ExecutionStatusDataType, ProjectOverviewStatsPageDataType, ProjectType } from "@workspace/types";

export const getProjectOverviewStats = async (projectId: string): Promise<ProjectOverviewStatsPageDataType> => {
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
                where: { id: projectId },
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
        const [workflow, executionCount] = await Promise.all([
            await prisma.workflow.findUnique({
                where: { id: workflowId, projectId: projectId }
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

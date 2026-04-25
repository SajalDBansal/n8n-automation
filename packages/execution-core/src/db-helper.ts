import prisma from "@workspace/database";
import type { ExecutionStatusDataType } from "@workspace/types";

export const updateExecutionStatusInDB = async (
    executionId: string,
    status: "CANCELLED" | "CRASHED" | "ERROR" | "STARTING" | "SUCCESS" | "RUNNING",
    isFinished: boolean = false
) => {
    try {
        const updatedData: ExecutionStatusDataType = {
            status, isFinished
        }

        if (status === "RUNNING" && !isFinished) {
            updatedData.startedAt = new Date();
        }

        if (isFinished) {
            updatedData.stoppedAt = new Date();
        }

        await prisma.execution.update({
            where: { id: executionId },
            data: updatedData
        });

    } catch (error) {
        console.error(`Failed to update execution status for ${executionId}:`, error);

    }

}
import { useProjectStore } from "@/store/projects";
import { createId } from "@paralleldrive/cuid2";
import { WorkflowType } from "@workspace/types";
import { createWorkflow } from "../db/workflow";

export const createWorkflowOptimistic = async (projectId: string, data: Partial<WorkflowType>) => {
    const { addWorkflow } = useProjectStore.getState();
    const workflowId = createId();

    const newWorkflow = {
        id: workflowId,
        name: data.name || "My Workflow",
        description: data.description
    }

    addWorkflow(projectId, newWorkflow);

    try {

        const res = await createWorkflow(projectId, newWorkflow);

        if (!res.success) throw new Error(res.error as string);

    } catch (error) {
        console.error("Error while creating a new workflow:", error);

    }
};
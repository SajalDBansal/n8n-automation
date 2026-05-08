import { useProjectStore } from "@/store/projects";
import { createId } from "@paralleldrive/cuid2";
import { WorkflowType } from "@workspace/types";
import { toast } from "sonner";
import { createWorkflow, deleteWorkflowByID, updateWorkflowById } from "../db/workflow";

export const createWorkflowOptimistic = async (projectId: string, data: Partial<WorkflowType>) => {
    const { addWorkflow, deleteWorkflow } = useProjectStore.getState();
    const workflowId = createId();

    const newWorkflow = {
        id: workflowId,
        name: data.name || "My Workflow",
        description: data.description
    }

    addWorkflow(projectId, newWorkflow);

    try {

        const res = await createWorkflow(projectId, newWorkflow);

        if (!res.success) throw new Error(res.message ?? "Failed to create workflow");

    } catch (error) {
        console.error("Error while creating a new workflow:", error);
        deleteWorkflow(projectId, workflowId);
        toast.error(error instanceof Error ? error.message : "Failed to create workflow");
    }
};

export const deleteWorkflowOptimistic = async (projectId: string, workflow: { id: string, name: string }) => {
    const { addWorkflow, deleteWorkflow } = useProjectStore.getState();

    deleteWorkflow(projectId, workflow.id);

    try {
        const res = await deleteWorkflowByID(projectId, workflow.id);
        if (!res.success) throw new Error(res.message ?? "Failed to delete workflow");

    } catch (error) {
        console.error("Error deleting workflow:", error);
        addWorkflow(projectId, workflow);
        toast.error(error instanceof Error ? error.message : "Failed to delete workflow");
    }
};

export const updateWorkflowOptimistic = async (projectId: string, workflow: { id: string, name: string, description: string }) => {
    const { projects, addWorkflow, deleteWorkflow } = useProjectStore.getState();

    const currentProject = projects?.find((p) => p.id === projectId) ?? null;
    const currentWorkflow = currentProject?.workflows ? currentProject?.workflows.find((flow) => flow.id === workflow.id) : null;

    if (!currentWorkflow) return;

    try {
        deleteWorkflow(projectId, workflow.id);
        addWorkflow(projectId, { id: workflow.id, name: workflow.name, description: workflow.description });

        const res = await updateWorkflowById(projectId, workflow);

        if (!res.success) throw new Error(res.message ?? "Failed to update workflow");

    } catch (error) {
        console.error("Error updating workflow:", error);
        deleteWorkflow(projectId, workflow.id);
        addWorkflow(projectId, currentWorkflow);
        toast.error(error instanceof Error ? error.message : "Failed to update workflow");
    }
};

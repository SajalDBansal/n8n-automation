import { WorkflowType } from "@workspace/types";
import axios from "axios";

type createWorkflowReturn = {
    success: boolean,
    message?: string,
    error?: unknown,
    workflow?: Partial<WorkflowType>
}

export const createWorkflow = async (projectId: string, data: Partial<WorkflowType>): Promise<createWorkflowReturn> => {
    try {
        const res = await axios.post(`/api/projects/${projectId}/workflow/create`, data);

        const workflowData = res.data.workflow;

        return {
            success: true,
            message: "project created successfully",
            workflow: workflowData
        }

    } catch (error) {
        return {
            success: false,
            error: error
        }
    }
}



export const getWorkflows = async (projectId: string) => {
    try {
        const res = await axios.get(`/api/projects/${projectId}/workflow`);

        const workflowData = res.data.workflows;

        return {
            success: true,
            message: "project created successfully",
            workflows: workflowData
        }

    } catch (error) {
        return {
            success: false,
            error: error
        }
    }
}
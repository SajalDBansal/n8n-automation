import { WorkflowType } from "@workspace/types";
import axios from "axios";

const getErrorMessage = (error: unknown, fallback: string): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || error.message || fallback;
    }
    return error instanceof Error ? error.message : fallback;
};

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
            message: "Workflow created successfully",
            workflow: workflowData
        }

    } catch (error) {
        return {
            success: false,
            message: getErrorMessage(error, "Failed to create workflow"),
            error: error
        }
    }
}

export const deleteWorkflowByID = async (projectId: string, workflowId: string) => {

    try {
        await axios.delete(`/api/projects/${projectId}/workflow/${workflowId}`);

        return {
            success: true,
            message: "Workflow deleted successfully",
        }

    } catch (error) {
        return {
            success: false,
            message: getErrorMessage(error, "Failed to delete workflow"),
            error: error
        }
    }
};

export const getWorkflows = async (projectId: string) => {
    try {
        const res = await axios.get(`/api/projects/${projectId}/workflow`);

        const workflowData = res.data.workflows;

        return {
            success: true,
            message: "Workflows fetched successfully",
            workflows: workflowData
        }

    } catch (error) {
        return {
            success: false,
            message: getErrorMessage(error, "Failed to fetch workflows"),
            error: error
        }
    }
}

export const getProjectCredentials = async (projectId: string) => {
    try {
        const res = await axios.get(`/api/projects/${projectId}/credentials`);

        const credentials = res.data.credentials;

        return {
            success: true,
            message: "Credentials fetched successfully",
            credentials: credentials
        }

    } catch (error) {
        return {
            success: false,
            message: getErrorMessage(error, "Failed to fetch credentials"),
            error: error
        }
    }
}

export const getAllWorkflows = async () => {
    try {
        const res = await axios.get(`/api/workflows`);

        const workflows = res.data.workflows;

        return {
            success: true,
            message: "Workflows fetched successfully",
            workflows: workflows
        }

    } catch (error) {
        return {
            success: false,
            message: getErrorMessage(error, "Failed to fetch workflows"),
            error: error
        }
    }
}

export const updateWorkflowById = async (projectId: string, data: { id: string, name: string, description: string }) => {
    try {
        await axios.patch(`/api/projects/${projectId}/workflow/${data.id}`, data);

        return {
            success: true,
            message: "Workflow updated successfully",
        }

    } catch (error) {
        return {
            success: false,
            message: getErrorMessage(error, "Failed to update workflow"),
            error: error
        }
    }
}

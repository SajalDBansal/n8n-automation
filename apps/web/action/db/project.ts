import { ProjectType } from "@workspace/types"
import axios from "axios"

const getErrorMessage = (error: unknown, fallback: string): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || error.message || fallback;
    }
    return error instanceof Error ? error.message : fallback;
};

type createProjectReturn = {
    success: boolean,
    message?: string,
    error?: unknown,
    projectData?: ProjectType
}

export const createProject = async (data: Partial<ProjectType>): Promise<createProjectReturn> => {
    try {
        const res = await axios.post('/api/projects', data);

        const projectData = res.data.project;

        return {
            success: true,
            message: "Project created successfully",
            projectData: projectData
        }

    } catch (error) {
        return {
            success: false,
            message: getErrorMessage(error, "Failed to create project"),
            error: error
        }
    }
}

type getAllProjectsReturn = {
    success: boolean,
    message?: string,
    error?: unknown,
    projects?: ProjectType[]
}

export const getAllProjects = async (): Promise<getAllProjectsReturn> => {
    try {
        const res = await axios.get('/api/projects');

        const projectData = res.data.projects;

        return {
            success: true,
            message: "Projects fetched successfully",
            projects: projectData
        }

    } catch (error) {
        return {
            success: false,
            message: getErrorMessage(error, "Failed to fetch projects"),
            error: error
        }
    }
}

type deleteProjectByIDReturn = {
    success: boolean,
    message?: string,
    error?: unknown,
}

export const deleteProjectByID = async (id: string, force: boolean): Promise<deleteProjectByIDReturn> => {

    try {
        await axios.delete(`/api/projects/${id}?force=${force}`);

        return {
            success: true,
            message: "Project deleted successfully",
        }

    } catch (error) {
        return {
            success: false,
            message: getErrorMessage(error, "Failed to delete project"),
            error: error
        }
    }
};

export const updateProjectById = async (projectId: string, data: Partial<ProjectType>): Promise<createProjectReturn> => {
    try {
        const res = await axios.patch(`/api/projects/${projectId}`, data);

        const projectData = res.data.project;

        return {
            success: true,
            message: "Project updated successfully",
            projectData: projectData
        }

    } catch (error) {
        return {
            success: false,
            message: getErrorMessage(error, "Failed to update project"),
            error: error
        }
    }
}

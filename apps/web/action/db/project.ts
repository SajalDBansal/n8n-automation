import prisma from "@workspace/database"
import { ProjectOverviewStatsPageDataType, ProjectType } from "@workspace/types"
import axios from "axios"

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
            message: "project created successfully",
            projectData: projectData
        }

    } catch (error) {
        return {
            success: false,
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
            message: "projects fetched successfully",
            projects: projectData
        }

    } catch (error) {
        return {
            success: false,
            error: error
        }
    }
}

type deleteProjectByIDReturn = {
    success: boolean,
    message?: string,
    error?: unknown,
}

export const deleteProjectByID = async (id: string): Promise<deleteProjectByIDReturn> => {

    try {
        const res = await axios.delete(`/api/projects/${id}`);

        return {
            success: true,
            message: "project deleted if no workflow init",
        }

    } catch (error) {
        return {
            success: false,
            error: error
        }
    }
};

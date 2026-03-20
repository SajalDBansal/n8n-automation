import { useProjectStore } from "@/store/projects";
import { createId } from "@paralleldrive/cuid2";
import { ProjectType } from "@workspace/types";
import { createProject, deleteProjectByID, getAllProjects, updateProjectById } from "../db/project";

export const createProjectOptimistic = async (data: Partial<ProjectType>) => {
    const { addProjects, deleteProject, updateProject } = useProjectStore.getState();
    const projectId = createId();

    const newProject: ProjectType = {
        id: projectId,
        name: data.name || "My Project",
        description: data.description,
        type: data.type || "PERSONAL",
        icon: { type: "ICON", value: "layers" },
        userId: "temp",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        workflows: []
    }

    addProjects(newProject);

    try {
        const res = await createProject({
            name: data.name || "My Project",
            description: data.description,
            type: data.type || "PERSONAL",
            icon: { type: "ICON", value: "layers" },
        });

        if (!res.success) throw new Error(res.error as string);
        if (res.projectData) updateProject(projectId, res.projectData);

    } catch (error) {
        deleteProject(projectId, false);
    }
};

export const updateProjectOptimistic = async (projectId: string, data: Partial<ProjectType>) => {
    const { projects, updateProject } = useProjectStore.getState();

    if (!projects) return;

    const currentData = projects.find((p) => p.id === projectId) ?? null;

    if (!currentData) return;

    const newData: Partial<ProjectType> = {
        name: data.name || currentData.name,
        description: data.description || currentData.description,
        type: data.type || currentData.type,
        icon: data.icon || currentData.icon,
        updatedAt: new Date().toISOString(),
    }

    try {
        updateProject(projectId, newData);

        const res = await updateProjectById(projectId, {
            name: newData.name,
            description: newData.description,
            type: newData.type,
            icon: newData.icon,
        });

        if (!res.success) throw new Error(res.error as string);
        if (res.projectData) updateProject(projectId, res.projectData);

    } catch (error) {
        updateProject(projectId, currentData);
    }
};

export const deleteProjectOptimistic = async (id: string, force: boolean) => {
    const { deleteProject } = useProjectStore.getState();

    try {
        const res = await deleteProjectByID(id, force);
        if (!res.success) throw new Error(res.error as string);
        deleteProject(id, force);

    } catch (error) {
        console.error("Error occured while fetch : ", error);
    }
};

export const getProjectById = async () => {

};

export const getAllProjectsOptimistic = async () => {
    const { setProjects } = useProjectStore.getState();

    try {
        const res = await getAllProjects();

        if (!res.success) throw new Error(res.error as string);
        if (res.projects) setProjects(res.projects);

    } catch (error) {
        console.error("Error occured while fetch : ", error);
    }

};
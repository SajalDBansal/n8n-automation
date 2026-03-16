import { useProjectStore } from "@/store/projects";
import { createId } from "@paralleldrive/cuid2";
import { ProjectType } from "@workspace/types";
import { createProject, deleteProjectByID, getAllProjects } from "../db/project";

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
        deleteProject(projectId);
    }
};

export const updateProject = async () => { };

export const deleteProjectOptimistic = async (id: string) => {
    const { deleteProject } = useProjectStore.getState();

    try {
        const res = await deleteProjectByID(id);
        if (!res.success) throw new Error(res.error as string);
        deleteProject(id);

    } catch (error) {
        console.error("Error occured while fetch : ", error);
    }
};

export const getProjectById = async () => { };

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
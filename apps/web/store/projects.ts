import { ProjectStoreType } from "@workspace/types";
import { create } from "zustand";

export const useProjectStore = create<ProjectStoreType>((set) => ({
    projects: null,

    setProjects: (projects) => set({ projects }),

    updateProject: (projectId, updates) =>
        set((state) => ({
            projects: state.projects ? state.projects.map((project) =>
                project.id === projectId ? {
                    ...project, ...updates, updatedAt: new Date().toISOString()
                } : project) : null
        }))
    ,

    addProjects: (project) => set((state) => ({
        projects: [...(state.projects || []), project]
    })),

    deleteProject: (projectId) => set((state) => ({
        projects: state.projects ? state.projects.filter((project) =>
            project.id === projectId ? (
                project.workflows && project.workflows.length > 0
            ) : true) : null
    })),

    addWorkflow: (projectId, workflow) => set((state) => ({
        projects: state.projects ? state.projects.map((project) =>
            project.id === projectId ? {
                ...project, workflows: [...project.workflows || [], workflow], updatedAt: new Date().toISOString()
            } : project) : null
    }))
}))
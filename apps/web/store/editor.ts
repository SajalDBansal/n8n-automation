import { EditorStoreType } from "@workspace/types";
import { applyNodeChanges, applyEdgeChanges, addEdge, Edge, NodeChange } from "@xyflow/react";
import axios from "axios";
import { create } from "zustand";
import { useWorkflowStore } from "./workflow";

const normalizeHandleId = (handle: unknown): string | undefined => {
    if (handle === null || handle === undefined) return undefined;
    if (typeof handle !== "string") return undefined;
    const trimmed = handle.trim();
    if (!trimmed || trimmed === "null" || trimmed === "undefined") return undefined;
    return trimmed;
};

const normalizeEdgeHandles = <T extends { sourceHandle?: unknown; targetHandle?: unknown }>(
    edge: T
): T & { sourceHandle?: string; targetHandle?: string } => {
    const sourceHandle = normalizeHandleId(edge.sourceHandle);
    const targetHandle = normalizeHandleId(edge.targetHandle);

    return {
        ...edge,
        ...(sourceHandle !== undefined ? { sourceHandle } : { sourceHandle: undefined }),
        ...(targetHandle !== undefined ? { targetHandle } : { targetHandle: undefined }),
    };
};

export const useWorkflowEditor = create<EditorStoreType>((set, get) => ({
    nodes: [],
    edges: [],
    workflow: null,
    isLoading: false,
    error: null,

    // setters
    setNodes: (updater) => set((state) => ({
        nodes: typeof updater === "function" ? updater(state.nodes) : updater
    })),
    setEdges: (updater) => set((state) => ({
        edges: typeof updater === "function" ? updater(state.edges) : updater
    })),
    setWorkflowInEditor: (workflow) => set({ workflow }),

    // actions
    onNodesChange: (changes) => {
        set((state) => {
            const deletedNodeIds = changes
                .filter((c: any) => c.type === "remove")
                .map((c: any) => c.id);

            let updatedEdges = state.edges;

            if (deletedNodeIds.length > 0) {
                updatedEdges = state.edges.filter(
                    (edge) =>
                        !deletedNodeIds.includes(edge.source) &&
                        !deletedNodeIds.includes(edge.target)
                );
            }

            return {
                nodes: applyNodeChanges(changes, state.nodes),
                edges: updatedEdges,
            };
        });
    },

    onEdgesChange: (changes) => {
        set((state) => ({
            edges: applyEdgeChanges(changes, state.edges),
        }));
    },

    onConnect: (params) => {
        set((state) => {
            const safeParams = {
                ...params,
                sourceHandle: normalizeHandleId(params.sourceHandle),
                targetHandle: normalizeHandleId(params.targetHandle),
            };
            let edges = state.edges;

            // Agent bottom handles
            if (
                safeParams.sourceHandle &&
                ["chat-model", "memory", "tool"].includes(safeParams.sourceHandle)
            ) {
                edges = edges.filter(
                    (e) =>
                        !(
                            e.source === safeParams.source &&
                            e.sourceHandle === safeParams.sourceHandle
                        )
                );
            }

            // Model → agent restriction
            if (
                safeParams.targetHandle &&
                ["chat-model", "memory", "tool"].includes(safeParams.targetHandle)
            ) {
                edges = edges.filter((e) => e.source !== safeParams.source);
            }

            return { edges: addEdge(safeParams, edges) };
        });
    },

    saveWorkflow: async (projectId, workflowId) => {
        const { nodes, edges, workflow } = get();

        if (!workflow) return;

        const newNodes = nodes.map((node) => {
            delete node.data.engine;

            return {
                ...node,
                positionX: node.position.x,
                positionY: node.position.y,
            }
        })

        try {

            const payload = {
                name: workflow.name,
                nodes: newNodes,
                edges: edges.map((e) => normalizeEdgeHandles(e)),
                active: workflow.active,
                projectId: projectId
            };

            console.log(payload);

            const res = await axios.patch(
                `/api/projects/${projectId}/workflow/${workflowId}/update`,
                payload
            );

            if (!res.data.success) {
                set({ error: res.data.message });
                return;
            }

            set({ workflow: res.data.workflow });
            useWorkflowStore.getState().setWorkflow(workflow);

        } catch (err) {
            set({ error: "Failed to save workflow" });
            throw err;
        }
    },

    updateWorkflowData: (updates) => {
        set((state) => ({
            workflow: state.workflow
                ? { ...state.workflow, ...updates }
                : null,
        }));
    },
}))
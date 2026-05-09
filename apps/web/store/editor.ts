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

const MAX_HISTORY = 50;

export const useWorkflowEditor = create<EditorStoreType>((set, get) => ({
    nodes: [],
    edges: [],
    workflow: null,
    isLoading: false,
    error: null,
    history: [],
    future: [],
    isDragging: false,

    // setters
    setNodes: (updater) => set((state) => ({
        nodes: typeof updater === "function" ? updater(state.nodes) : updater
    })),
    setEdges: (updater) => set((state) => ({
        edges: typeof updater === "function" ? updater(state.edges) : updater
    })),
    setWorkflowInEditor: (workflow) => set({ workflow, history: [], future: [] }),

    // history
    pushHistory: () => set((state) => ({
        history: [...state.history, { nodes: state.nodes, edges: state.edges }].slice(-MAX_HISTORY),
        future: [],
    })),
    undo: () => set((state) => {
        if (state.history.length === 0) return state;
        const previous = state.history[state.history.length - 1]!;
        return {
            nodes: previous.nodes,
            edges: previous.edges,
            history: state.history.slice(0, -1),
            future: [{ nodes: state.nodes, edges: state.edges }, ...state.future].slice(0, MAX_HISTORY),
        };
    }),
    redo: () => set((state) => {
        if (state.future.length === 0) return state;
        const next = state.future[0]!;
        return {
            nodes: next.nodes,
            edges: next.edges,
            future: state.future.slice(1),
            history: [...state.history, { nodes: state.nodes, edges: state.edges }].slice(-MAX_HISTORY),
        };
    }),

    // actions
    onNodesChange: (changes) => {
        set((state) => {
            const deletedNodeIds = changes
                .filter((c: any) => c.type === "remove")
                .map((c: any) => c.id);

            const dragStarting = changes.some((c: any) => c.type === "position" && c.dragging === true) && !state.isDragging;
            const dragEnding = changes.some((c: any) => c.type === "position" && c.dragging === false);
            const shouldSnapshot = deletedNodeIds.length > 0 || dragStarting;

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
                isDragging: dragStarting ? true : dragEnding ? false : state.isDragging,
                ...(shouldSnapshot ? {
                    history: [...state.history, { nodes: state.nodes, edges: state.edges }].slice(-MAX_HISTORY),
                    future: [],
                } : {}),
            };
        });
    },

    onEdgesChange: (changes) => {
        set((state) => {
            const hasRemoval = changes.some((c: any) => c.type === "remove");

            return {
                edges: applyEdgeChanges(changes, state.edges),
                ...(hasRemoval ? {
                    history: [...state.history, { nodes: state.nodes, edges: state.edges }].slice(-MAX_HISTORY),
                    future: [],
                } : {}),
            };
        });
    },

    onConnect: (params) => {
        set((state) => {
            const safeParams = {
                ...params,
                sourceHandle: normalizeHandleId(params.sourceHandle),
                targetHandle: normalizeHandleId(params.targetHandle),
            };
            let edges = state.edges;

            // Agent's chat-model handle only ever has one connection — the
            // UI only ever produces "chat-model", never "memory"/"tool"
            // (those never shipped), so only that handle is checked.
            if (safeParams.sourceHandle === "chat-model") {
                edges = edges.filter(
                    (e) =>
                        !(
                            e.source === safeParams.source &&
                            e.sourceHandle === safeParams.sourceHandle
                        )
                );
            }

            // Model → agent restriction
            if (safeParams.targetHandle === "chat-model") {
                edges = edges.filter((e) => e.source !== safeParams.source);
            }

            return {
                edges: addEdge(safeParams, edges),
                history: [...state.history, { nodes: state.nodes, edges: state.edges }].slice(-MAX_HISTORY),
                future: [],
            };
        });
    },

    saveWorkflow: async (projectId, workflowId) => {
        const { nodes, edges, workflow } = get();

        if (!workflow) return;

        const newNodes = nodes.map((node) => {
            const { engine, ...cleanData } = node.data || {};

            return {
                ...node,
                data: cleanData,
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
                projectId: projectId,
                expectedUpdatedAt: workflow.updatedAt,
            };

            const res = await axios.patch(
                `/api/projects/${projectId}/workflow/${workflowId}/update`,
                payload
            );

            if (!res.data.success) {
                set({ error: res.data.message });
                return;
            }

            set((state) => ({
                workflow: state.workflow
                    ? { ...state.workflow, ...res.data.workflow }
                    : res.data.workflow
            }));
            useWorkflowStore.getState().setWorkflow(res.data.workflow);

        } catch (err) {
            const conflictMessage = axios.isAxiosError(err) && err.response?.status === 409
                ? (err.response?.data?.message as string | undefined) ?? "This workflow was changed elsewhere. Reload before saving."
                : "Failed to save workflow";
            set({ error: conflictMessage });
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
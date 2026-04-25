import { WorkflowStoreType } from "@workspace/types";
import { create } from "zustand";

export const useWorkflowStore = create<WorkflowStoreType>((set, get) => ({
    workflow: null,
    selectedNodeId: null,
    selectedEdgeId: null,
    jsonOutput: null,

    // setters
    setWorkflow: (workflow) => set({ workflow }),
    setNodes: (nodes) => set((state) => ({ workflow: state.workflow ? { ...state.workflow, nodes } : null })),
    setEdges: (edges) => set((state) => ({ workflow: state.workflow ? { ...state.workflow, edges } : null })),
    setSelectedNodeId: (id) => set({ selectedNodeId: id }),
    setSelectedEdgeId: (id) => set({ selectedEdgeId: id }),
    setJsonOutputs: (json) => set({ jsonOutput: json }),

    // node operations
    addNode: (node) => set((state) => ({
        workflow: state.workflow ?
            { ...state.workflow, nodes: [...(state.workflow.nodes || []), node] }
            : null
    })),
    removeNode: (nodeId) => set((state) => ({
        workflow: state.workflow ?
            {
                ...state.workflow,
                nodes: state.workflow.nodes.filter((node) => node.id !== nodeId),
                edges: state.workflow.edges.filter((edge) => edge.source !== nodeId || edge.target !== nodeId)
            }
            : null
    })),
    changeNodeProperty: (nodeId, key, value) => set((state) => {
        if (!state.workflow) return state;

        return {
            workflow: {
                ...state.workflow,
                nodes: state.workflow.nodes.map((node) =>
                    node.id === nodeId ? { ...node, [key]: value } : node)
            }
        }
    }),
    nodeParameterChangeHandler: (key, value) => set((state) => {
        if (!state.workflow) return state;

        return {
            workflow: {
                ...state.workflow,
                nodes: state.workflow.nodes.map((node) => {
                    if (node.id === state.selectedNodeId) {
                        return {
                            ...node,
                            parameters: {
                                ...node.parameters,
                                [key]: value,
                            }
                        }
                    }

                    return node;
                })
            }
        }
    }),

    // edge operations
    addEdge: (edge) => set((state) => ({
        workflow: state.workflow ?
            { ...state.workflow, edges: [...(state.workflow.edges || []), edge] }
            : null
    })),
    removeEdge: (edgeId) => set((state) => ({
        workflow: state.workflow ?
            { ...state.workflow, edges: state.workflow.edges.filter((edge) => edge.id !== edgeId) }
            : null
    })),

    // selectors / helpers
    getSelectedNode: () => {
        const { workflow, selectedNodeId } = get();
        if (!workflow) return null;
        return workflow.nodes.find((node) => node.id === selectedNodeId) || null;

    },
    getSelectedEdge: () => {
        const { workflow, selectedEdgeId } = get();
        if (!workflow) return null;
        return workflow.edges.find((edge) => edge.id === selectedEdgeId) || null;
    },
    getJsonOutputById: (nodeId) => {
        const { jsonOutput } = get();
        if (!jsonOutput) return null;
        return jsonOutput[nodeId] || null;
    },
    getInputsForNode: (nodeId) => {
        const { workflow, jsonOutput } = get();
        // console.log("workflow", workflow);
        // console.log("jsonoutput", jsonOutput);

        if (!workflow) return {};

        const inputNodes: Record<string, any> = {};

        const traversBack = (currentNodeId: string, visited: Set<string> = new Set()) => {
            if (visited.has(currentNodeId)) return;
            visited.add(currentNodeId);

            if (!workflow.edges) return;

            // get edges where current noe is target
            const parentEdges = workflow.edges.filter((edge) => edge.target === currentNodeId);

            parentEdges.forEach((edge) => {
                const parentNode = workflow.nodes.find((node) => node.id === edge.source);
                if (!parentNode) return;
                if (jsonOutput && jsonOutput[parentNode.id]) {
                    inputNodes[parentNode.id] = jsonOutput[parentNode.id];
                }
                traversBack(parentNode.id, visited);

            });
        }

        traversBack(nodeId);

        return inputNodes;

    },
}))
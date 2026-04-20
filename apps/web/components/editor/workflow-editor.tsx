"use client";
import { useWorkflowEditor } from "@/store/editor";
import { useWorkflowStore } from "@/store/workflow";
import { nodeTypes } from "@/utils/node-types";
import { Node, NodeName, NodeType, NodeTypeFromDB } from "@workspace/types";
import { Edge, Node as RFNode } from "@xyflow/react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@workspace/ui/components/resizable";
import { Background, Controls, IsValidConnection, MiniMap, ReactFlow, ReactFlowInstance } from "@xyflow/react";
import { DragEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import cuid from "cuid";
import { Button } from "@workspace/ui/components/button";
import EditorSidebar from "./editor-sidebar";
import { getNodeMetadata } from "@/lib/node-registery";
import { DeletableEdge } from "../custom-edge/deletable-edge";

interface NodeExecutionState {
    [nodeId: string]: {
        status: 'idle' | 'executing' | 'success' | 'failed';
        message?: string;
        response?: unknown;
    };
}

interface ExecutionMessage {
    nodeId?: string;
    nodeName?: string;
    executionId: string;
    workflowId?: string;
    status: string;
    message?: string;
    nodeStatus?: 'executing' | 'success' | 'failed';
    response?: Record<string, unknown>;
    json?: Record<string, unknown>
}

interface WorkflowSnapshot {
    name: string;
    active: boolean;
    tags: string[];
    projectId?: string;
    nodes: unknown[];
    edges: unknown[];
}

const normalizeNodeForSnapshot = (node: Node): unknown => {
    const normalizedNode = { ...node } as Record<string, unknown>;
    delete normalizedNode.selected;
    delete normalizedNode.dragging;
    delete normalizedNode.measured;
    delete normalizedNode.searchNode;
    delete normalizedNode.positionAbsolute;

    return normalizedNode;
};

const normalizeEdgeForSnapshot = (edge: Edge): unknown => {
    const normalizedEdge = { ...edge } as Record<string, unknown>;
    delete normalizedEdge.selected;

    return normalizedEdge;
};

const createSnapshotString = (
    nodes: Node[],
    edges: Edge[],
    workflowData: { name?: string; active?: boolean; tags?: string[]; projectId?: string } | null,
    fallbackProjectId?: string
): string => {
    const snapshot: WorkflowSnapshot = {
        name: workflowData?.name || 'New Workflow',
        active: workflowData?.active || false,
        tags: workflowData?.tags || [],
        projectId: workflowData?.projectId || fallbackProjectId,
        nodes: nodes.map(normalizeNodeForSnapshot),
        edges: edges.map(normalizeEdgeForSnapshot),
    };

    return JSON.stringify(snapshot);
};

const safePosition = (pos: any, i: number) => ({
    x: typeof pos?.x === "number" ? pos.x : 100 * i,
    y: typeof pos?.y === "number" ? pos.y : 100,
});

const normalizeHandleId = (handle: unknown): string | undefined => {
    if (handle === null || handle === undefined) return undefined;
    if (typeof handle !== "string") return undefined;
    const trimmed = handle.trim();
    if (!trimmed || trimmed === "null" || trimmed === "undefined") return undefined;
    return trimmed;
};

const normalizeLoadedEdges = (edges: unknown[]): Edge[] => {
    return (edges as Edge[]).map((e) => ({
        ...e,
        sourceHandle: normalizeHandleId((e as any).sourceHandle),
        targetHandle: normalizeHandleId((e as any).targetHandle),
    }));
};

export default function WorkflowEditor({ workflowId, projectId }: { workflowId: string, projectId: string }) {
    const [loadingWorkflow, setLoadingWorkflow] = useState(false);
    const [nodeExecutionStates, setNodeExecutionStates] = useState<NodeExecutionState>({});
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
    const [executionLogs, setExecutionLogs] = useState<ExecutionMessage[]>([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<any, any>>()
    const [isSaving, setIsSaving] = useState(false);
    const savedSnapshotRef = useRef<string | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const [executionOutput, setExecutionOutput] = useState<unknown>(null);
    const workflowStore = useWorkflowStore();
    const { nodes,
        edges,
        workflow,
        setNodes,
        setEdges,
        saveWorkflow,
        onEdgesChange,
        setWorkflowInEditor,
        onNodesChange,
        onConnect,
    } = useWorkflowEditor();

    const currentSnapshot = useMemo(
        () => createSnapshotString(nodes, edges, workflow, projectId),
        [nodes, edges, workflow, projectId]
    );

    useEffect(() => {
        if (!savedSnapshotRef.current) return;

        setHasUnsavedChanges(currentSnapshot !== savedSnapshotRef.current);
    }, [currentSnapshot]);

    const getWorkflow = async () => {
        try {
            setLoadingWorkflow(true);
            const res = await fetch(`/api/projects/${projectId}/workflow/${workflowId}`);
            const json = await res.json();
            const data = json?.data;

            if (!data) {
                toast.error("Failed to load workflow");
                return;
            }
            workflowStore.setWorkflow(data);
            setWorkflowInEditor(data);

            const initialNodes: Node[] = (data.nodes ?? []).map((node: NodeTypeFromDB) => ({
                ...node,
                position: { x: node.positionX, y: node.positionY },
            }));


            setNodes(initialNodes);
            setEdges(normalizeLoadedEdges(data.edges ?? []));

            // ✅ set baseline snapshot AFTER state is ready
            const initialSnapshot = createSnapshotString(
                initialNodes,
                normalizeLoadedEdges(data.edges ?? []),
                data,
                projectId
            );

            savedSnapshotRef.current = initialSnapshot;
            setHasUnsavedChanges(false);
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingWorkflow(false);
        }
    }

    useEffect(() => {
        getWorkflow();
    }, [workflowId, projectId]);

    const handleDeleteNode = useCallback((nodeId: string) => {
        onNodesChange([{ id: nodeId, type: 'remove' }]);
    }, [onNodesChange])

    const handleDeleteEdge = useCallback((edgeId: string) => {
        onEdgesChange([{ type: 'remove', id: edgeId }]);
    }, [onEdgesChange]);

    const edgeTypes = useMemo(() => ({
        deletable: DeletableEdge,
    }), []);

    const nodeswithStatusAndDeleteHandler = useMemo(() => {

        return nodes.map((node) => ({
            ...node,
            data: {
                engine: { ...node },
                executionStatus: nodeExecutionStates[node.id]?.status || 'idle',
                onDelete: handleDeleteNode,
            }
        }))
    }, [nodes, nodeExecutionStates, handleDeleteNode]);

    const edgesWithDeleteHandler = useMemo(() => {
        return edges.map(edge => ({
            ...edge,
            type: 'deletable',
            data: {
                ...edge.data,
                onDelete: handleDeleteEdge
            }
        }));
    }, [edges, handleDeleteEdge]);

    const handleNodeDoubleClick = (event: React.MouseEvent, node: Node) => {
        console.log(node);
        console.log(nodes);

        console.log('executionLogs', executionLogs);
        setSelectedNode(node);
        workflowStore.setSelectedNodeId(node.id)
        setIsNodeModalOpen(true);
    };

    // const isValidConnection: IsValidConnection = useCallback((conn) => {
    //     const source = conn.source;
    //     const target = conn.target;

    //     // normalize null → undefined (important)
    //     const sourceHandle = conn.sourceHandle ?? undefined;
    //     const targetHandle = conn.targetHandle ?? undefined;

    //     const sourceNode = nodes.find((n) => n.id === source);
    //     const targetNode = nodes.find((n) => n.id === target);

    //     if (!sourceNode || !targetNode) {
    //         toast.error("Invalid connection: Source or target node not found");
    //         return false;
    //     }

    //     const sourceEngineType: NodeType | undefined = (sourceNode as Node).type;
    //     const targetEngineType: NodeType | undefined = (targetNode as Node).type;

    //     if (targetEngineType === "CHAT_MODEL") {
    //         if (sourceEngineType !== "AGENT") {
    //             toast.error("Only Agent nodes can connect to Chat Model nodes");
    //             return false;
    //         }
    //     }

    //     // Agent → Model (bottom handles)
    //     if (sourceEngineType === "AGENT" && sourceHandle) {
    //         if (["chat-model", "memory", "tool"].includes(sourceHandle)) {
    //             // type constraint
    //             if (
    //                 sourceHandle === "chat-model" &&
    //                 targetEngineType !== "CHAT_MODEL"
    //             ) {
    //                 toast.error(
    //                     "Chat Model handle can only connect to Model nodes"
    //                 );
    //                 return false;
    //             }

    //             // single connection per handle
    //             const exists = edges.find(
    //                 (e) =>
    //                     e.source === source &&
    //                     e.sourceHandle === sourceHandle
    //             );

    //             if (exists) {
    //                 toast.error(
    //                     `This ${sourceHandle} handle already has a connection`
    //                 );
    //                 return false;
    //             }
    //         }
    //     }

    //     // Model → Agent
    //     if (targetEngineType === "AGENT" && targetHandle) {
    //         if (["chat-model", "memory", "tool"].includes(targetHandle)) {
    //             const exists = edges.find((e) => e.source === source);

    //             if (exists) {
    //                 toast.error(
    //                     "This model node can only connect to one agent"
    //                 );
    //                 return false;
    //             }
    //         }
    //     }

    //     return true;
    // },
    //     [nodes, edges]
    // );

    const isValidConnection: IsValidConnection = useCallback((conn) => {
        const { source, target } = conn;

        const sourceHandle = conn.sourceHandle ?? undefined;
        const targetHandle = conn.targetHandle ?? undefined;

        const sourceNode = nodes.find((n) => n.id === source);
        const targetNode = nodes.find((n) => n.id === target);

        if (!sourceNode || !targetNode) {
            toast.error("Invalid connection: Source or target node not found");
            return false;
        }

        const sourceType = sourceNode.type as NodeType;
        const targetType = targetNode.type as NodeType;

        // =========================
        // 🚫 GLOBAL MODEL RULES
        // =========================

        // Only AGENT → CHAT_MODEL allowed
        if (targetType === "CHAT_MODEL" && sourceType !== "AGENT") {
            toast.error("Only Agent nodes can connect to Chat Model");
            return false;
        }

        // Model can only connect to Agent
        if (sourceType === "CHAT_MODEL" && targetType !== "AGENT") {
            toast.error("Chat Model can only connect to Agent nodes");
            return false;
        }

        // =========================
        // 🎯 AGENT HANDLE RULES
        // =========================

        if (sourceType === "AGENT") {
            // Enforce correct handle usage
            if (sourceHandle === "chat-model") {
                if (targetType !== "CHAT_MODEL") {
                    toast.error("chat-model handle must connect to a Chat Model node");
                    return false;
                }

                // single connection per handle
                const exists = edges.find(
                    (e) =>
                        e.source === source &&
                        e.sourceHandle === "chat-model"
                );

                if (exists) {
                    toast.error("Agent already has a Chat Model connected");
                    return false;
                }
            }
        }

        // =========================
        // 🎯 MODEL HANDLE RULES
        // =========================

        if (sourceType === "CHAT_MODEL") {
            // optional: restrict 1 outgoing connection
            const exists = edges.find((e) => e.source === source);

            if (exists) {
                toast.error("This Chat Model is already connected to an Agent");
                return false;
            }
        }

        return true;
    }, [nodes, edges]);

    const onDrop = useCallback(async (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();

        const name: NodeName = event.dataTransfer.getData('application/reactflow') as NodeName

        if (typeof name === "undefined" || !name) {
            toast.error("Invalid node type");
            return;
        }

        const triggerAlreadyExists = nodes.some((node) => (node as Node)?.type === "TRIGGER");

        if (name === "manualTrigger" && triggerAlreadyExists) {
            toast.error("Trigger already exists");
            return;
        }

        if (!reactFlowInstance) return;

        const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });

        try {
            const nodeData = getNodeMetadata(name);
            if (!nodeData) throw new Error("Missing node metadata");

            const id = cuid();

            const newNode: Node = {
                id,
                name: nodeData.name,
                type: nodeData.type,
                position: { x: position.x, y: position.y },
                parameters: {},
                data: {},
                credentialId: undefined,
            };

            setNodes((prev) => [...prev, newNode]);
        } catch (error) {
            console.error("Failed to fetch node metadata:", error);
            toast.error("Failed to create node");
        }

    }, [reactFlowInstance, setNodes]);

    const onDragOver = useCallback((event: any) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
    }, [])

    const handleSave = async () => {
        setIsSaving(true);

        try {
            const res = await saveWorkflow(projectId, workflowId);

            savedSnapshotRef.current = currentSnapshot;
            setHasUnsavedChanges(false);

        } catch (error) {
            console.error("Error saving workflow:", error);
            toast.error('Error saving workflow. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleExecuteWorkflow = async () => {

        setNodeExecutionStates({});
        setExecutionLogs([]);
        setIsExecuting(true);

        toast.loading('Starting workflow execution...', {
            id: 'workflow-execution',
            duration: 2000,
        });

        const eventSource = new EventSource("/api/projects/" + projectId + "/workflow/" + workflowId + "/execute");

        eventSource.onopen = (event) => {
            console.log("Connection opened:", event);
            toast.success('Workflow execution started', {
                id: 'workflow-execution',
            });
        }

        eventSource.onmessage = (event) => {
            const parsedData: ExecutionMessage = JSON.parse(event.data);

            // Add to execution logs
            setExecutionLogs((currentLogs) => [...currentLogs, parsedData]);

            // Update node execution states
            if (parsedData.nodeId) {
                setNodeExecutionStates((prevStates) => ({
                    ...prevStates,
                    [parsedData.nodeId!]: {
                        status: parsedData.nodeStatus === 'executing' ? 'executing' :
                            parsedData.nodeStatus === 'success' ? 'success' :
                                parsedData.nodeStatus === 'failed' ? 'failed' : 'idle',
                        message: parsedData.message,
                        response: parsedData.response,
                    }
                }));

                // Show toast for node failures
                if (parsedData.nodeStatus === 'failed') {
                    let errorMessage = 'Unknown error';
                    const responseError = parsedData.response?.['error'];
                    const responseMessage = parsedData.response?.['message'];

                    // Extract error message from various possible locations
                    if (parsedData.message) {
                        errorMessage = parsedData.message;
                    } else if (responseError !== undefined) {
                        errorMessage = typeof responseError === 'string'
                            ? responseError
                            : JSON.stringify(responseError);
                    } else if (typeof responseMessage === 'string') {
                        errorMessage = responseMessage;
                    }

                    toast.error(
                        `Node "${parsedData.nodeName || parsedData.nodeId}" failed:\n${errorMessage}`,
                        {
                            duration: 8000,
                            style: {
                                maxWidth: '500px',
                                whiteSpace: 'pre-line',
                            },
                        }
                    );
                }
            }

            // Check if workflow execution finished
            if (parsedData.status === "Success") {
                console.log("Workflow execution completed successfully", executionLogs);
                setIsExecuting(false);
                eventSource.close();
                workflowStore.setJsonOutputs(parsedData.json!);

                setExecutionOutput(parsedData.json);
                // setIsOutputPanelOpen(true);

                toast.success('Workflow executed successfully!', {
                    duration: 4000,
                });
            } else if (parsedData.status === "Failed") {
                console.log("Workflow execution failed", executionLogs);

                setIsExecuting(false);
                eventSource.close();
                workflowStore.setJsonOutputs(parsedData.json!);

                // Only show workflow failure toast if we didn't just show a node failure toast
                if (parsedData.nodeStatus !== 'failed') {
                    let errorMessage = 'Unknown error occurred';
                    const responseError = parsedData.response?.['error'];
                    if (parsedData.message) {
                        errorMessage = parsedData.message;
                    } else if (responseError !== undefined) {
                        errorMessage = typeof responseError === 'string'
                            ? responseError
                            : JSON.stringify(responseError);
                    }

                    toast.error(
                        `Workflow execution failed:\n${errorMessage}`,
                        {
                            duration: 8000,
                            style: {
                                maxWidth: '500px',
                                whiteSpace: 'pre-line',
                            },
                        }
                    );
                }
            }
        }

        eventSource.onerror = (error) => {
            console.error("Error occurred:", error);
            setIsExecuting(false);
            eventSource.close();
            toast.error('Workflow execution failed due to connection error', {
                duration: 5000,
            });
        }
    }

    const handleNodeModalClose = () => {
        setIsNodeModalOpen(false);
        workflowStore.setSelectedNodeId(null)
        setSelectedNode(null);
    };

    const handleNodeSave = (updatedNode: Node) => {
        setNodes((currentNodes) => {
            const updatedNodes = currentNodes.map((node) =>
                node.id === updatedNode.id ? updatedNode : node
            )

            workflowStore.setNodes(updatedNodes);

            // // Show success toast for node configuration save
            // toast.success(`Node "${updatedNode.data.label || updatedNode.name}" configuration saved!`, {
            //     duration: 3000,
            // });

            return updatedNodes;
        });
    };

    return (
        <div className="flex h-full">
            <ResizablePanelGroup orientation="horizontal">
                <ResizablePanel defaultSize={80}>
                    <div className="flex h-full items-center justify-center">
                        <div
                            className="relative w-full h-full"
                        >
                            {loadingWorkflow ? (
                                <div className="absolute flex h-full w-full items-center justify-center">
                                    <svg
                                        aria-hidden="true"
                                        className="inline h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
                                        viewBox="0 0 100 101"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                            fill="currentColor"
                                        />
                                        <path
                                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                            fill="currentFill"
                                        />
                                    </svg>
                                </div>

                            ) : (
                                <ReactFlow
                                    className="w-[300px]"
                                    fitView
                                    nodes={nodeswithStatusAndDeleteHandler}
                                    edges={edgesWithDeleteHandler}
                                    onConnect={onConnect}
                                    onNodesChange={onNodesChange}
                                    onEdgesChange={onEdgesChange}
                                    nodeTypes={nodeTypes}
                                    edgeTypes={edgeTypes}
                                    onNodeDoubleClick={handleNodeDoubleClick}
                                    isValidConnection={isValidConnection}
                                    onInit={setReactFlowInstance}
                                    onDrop={onDrop}
                                    onDragOver={onDragOver}
                                // onClick={handleClickCanvas}
                                >
                                    <Controls position="top-left" className="text-black" />
                                    <MiniMap
                                        position="bottom-left"
                                        className="bg-black"
                                        zoomable
                                        pannable
                                    />
                                    <Background
                                        gap={12}
                                        size={1}
                                    />

                                </ReactFlow>
                            )}

                        </div>
                    </div>

                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={20} className="relative sm:block">
                    {loadingWorkflow ? (
                        <div className="absolute flex h-full w-full items-center justify-center">
                            <svg
                                aria-hidden="true"
                                className="inline h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
                                viewBox="0 0 100 101"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                    fill="currentColor"
                                />
                                <path
                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                    fill="currentFill"
                                />
                            </svg>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-3 p-4">
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving || !hasUnsavedChanges}
                                >
                                    {isSaving ? 'Saving...' : 'Save'}
                                </Button>
                                <Button
                                    className="cursor-pointer disabled:opacity-50 px-6 py-2"
                                    onClick={handleExecuteWorkflow}
                                    disabled={isExecuting}
                                >
                                    {isExecuting ? 'Executing...' : 'Execute Workflow'}
                                </Button>
                            </div>

                            <EditorSidebar nodes={nodes} />
                        </div>
                    )}
                </ResizablePanel>
            </ResizablePanelGroup>

            {/* <NodeConfigModal
                projectId={projectId}
                node={selectedNode}
                isOpen={isNodeModalOpen}
                onClose={handleNodeModalClose}
                onSave={handleNodeSave}
            /> */}
        </div>
    )
}
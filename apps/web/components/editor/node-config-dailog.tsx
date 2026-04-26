"use client";
import { getTriggerNodeIcon } from "@/lib/node-registery";
import { CredentialRecord, Node, NodeName, NodeBaseProperties, NodeCredentialsName } from "@workspace/types";
import { Button } from "@workspace/ui/components/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import { WebhookDocs, ResendDocs, TelegramDocs, AgentDocs, GoogleGeminiChatDocs, ManualTriggerDocs } from "./node-docs";
import { Input } from "@workspace/ui/components/input";
import { NodeIcon } from "../ui/node-icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Separator } from "@workspace/ui/components/separator";
import { Settings } from "lucide-react";
import { Field, FieldDescription, FieldLabel } from "@workspace/ui/components/field";
import { useCallback, useEffect, useState } from "react";
import { useWorkflowStore } from "@/store/workflow";
import { PropertyRenderer } from "./property-renderer";
import NodeInputPanel from "./node-input-panel";
import NodeOutputPanel from "./node-output-panel";
import { getNodeCredentials } from "@/action/db/credentials";
import CredentialsSection from "../credentials/node-credentials-section";
import { availableCredentials } from "@/lib/credential-registry";
import CredentialConfigDrawer from "../credentials/credential-config-dialog";

type NodeConfigDrawerProps = {
    projectId: string;
    node: Node | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (nodeData: Node) => void;
}

export default function NodeConfigDrawer({
    projectId, node, isOpen, onClose, onSave
}: NodeConfigDrawerProps) {
    const [nodeData, setNodeData] = useState<Node | null>(node);
    const [credentials, setCredentials] = useState<CredentialRecord[]>([]);
    const [showCredentialsModal, setShowCredentialsModel] = useState(false);
    const [selectedCredentialsType, setSelectedCredentialsType] = useState<string | null>(null);
    const [nodeInputs, setNodeInputs] = useState<Record<string, unknown>>({});
    const workflowStore = useWorkflowStore();
    const nodeOutputs = workflowStore.getJsonOutputById(nodeData?.id || '');

    useEffect(() => {
        setNodeData(node);
    }, [node]);

    useEffect(() => {
        if (!nodeData || !nodeData.id) return;
        const inputs = workflowStore.getInputsForNode(nodeData.id);
        // console.log(inputs);

        setNodeInputs(inputs);
    }, [nodeData, setNodeInputs, workflowStore]);

    const icon = getTriggerNodeIcon(nodeData?.name as NodeName);

    const fetchCredentials = useCallback(async () => {
        if (!nodeData?.data.credentials || nodeData.data.credentials.length === 0) {
            return;
        }
        const cred = await getNodeCredentials(nodeData.data.credentials || [], projectId);
        setCredentials(cred);
    }, [nodeData, projectId]);

    const handleParametersChange = (key: string, value: string | number | boolean) => {
        if (!nodeData) return;

        workflowStore.nodeParameterChangeHandler(key, value);
        setNodeData((prev: Node | null) => {
            if (!prev) return null;
            return {
                ...prev,
                parameters: {
                    ...prev.parameters,
                    [key]: value
                }
            }
        })
    }

    const handleDescriptionChange = (newDescription: string) => {
        if (!nodeData) return;

        setNodeData((prev: Node | null) => {
            if (!prev) return null;
            return {
                ...prev,
                description: newDescription,
            }
        })
    }

    useEffect(() => {
        fetchCredentials();
    }, [fetchCredentials, isOpen])

    const handleCredentialChange = (credentialName: NodeCredentialsName, credentialId: string) => {
        if (!nodeData) return;

        setNodeData((prev: Node | null) => {
            if (!prev) return null;
            return {
                ...prev,
                credentialId,
            }
        })
    }

    const handleCreateCredential = (credentialName: NodeCredentialsName) => {
        setSelectedCredentialsType(credentialName);
        setShowCredentialsModel(true);
    }

    const closeCredentialsModel = () => {
        setShowCredentialsModel(false);
        setSelectedCredentialsType(null);
        fetchCredentials();
    }

    const renderProperty = (property: unknown) => {
        if (!property || typeof property !== 'object') return null

        const prop = property as NodeBaseProperties
        const currentValue = nodeData?.parameters[prop?.name] || prop.default || ''

        return (
            <PropertyRenderer
                property={prop}
                value={currentValue}
                onChange={(value: string | number | boolean) => handleParametersChange(prop.name, value)}
            />
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) onClose();
        }}>
            <DialogContent className='max-w-7xl flex flex-col p-0' style={{ height: "80vh", overflowY: "hidden" }}>
                <DialogHeader>
                    <DialogTitle className='border-b p-4'>
                        <div className="flex justify-between w-full pr-2">
                            <div className="flex justify-start items-center gap-4">
                                {/* image */}
                                <div className="flex items-center justify-center text-primary shrink-0">
                                    <NodeIcon
                                        icon={icon}
                                        size="lg"
                                        className="text-primary"
                                    />
                                </div>

                                <div className="flex">
                                    <div className="flex flex-col flex-1 min-w-0 py-0.5">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className="font-semibold text-2xl text-foreground truncate tracking-tight">
                                                {nodeData?.data.label}
                                            </span>

                                        </div>
                                        <DialogDescription>
                                            {nodeData?.description || ''}
                                        </DialogDescription>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <span className="text-sm font-mono text-muted-foreground/70 bg-muted/40 border border-border/40 px-1.5 py-0.5 rounded-md">
                                    ID: {nodeData?.id}
                                </span>
                            </div>
                        </div>

                    </DialogTitle>
                </DialogHeader>

                <div className="w-full flex flex-1 min-h-0 gap-4 px-4">

                    {/* Data fields */}
                    <div className="w-1/2 flex flex-col min-h-0">
                        <Tabs
                            defaultValue="input"
                            className="flex flex-col h-full overflow-hidden"
                        >
                            <TabsList className="bg-transparent">
                                <TabsTrigger value="input">Input Data</TabsTrigger>
                                <TabsTrigger value="output">Output Data</TabsTrigger>
                            </TabsList>
                            {/* <Separator /> */}

                            <TabsContent
                                value="input"
                                className="flex-1 overflow-hidden data-[state=active]:flex flex-col"
                            >
                                <NodeInputPanel nodeId={nodeData?.id || undefined} nodeInputs={nodeInputs} />

                            </TabsContent>

                            <TabsContent
                                value="output"
                                className="flex-1 overflow-hidden data-[state=active]:flex flex-col"
                            >
                                <NodeOutputPanel output={nodeOutputs} />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* parameter fields */}
                    <div className="w-1/2 flex flex-col min-h-0 border rounded-lg p-4 overflow-y-auto">
                        <Tabs
                            defaultValue="parameter"
                            className="flex flex-col h-full overflow-hidden"
                        >
                            <TabsList className="bg-transparent">
                                <TabsTrigger value="parameter">Parameter</TabsTrigger>
                                <TabsTrigger value="settings">Settings</TabsTrigger>
                                <TabsTrigger value="docs">Docs</TabsTrigger>
                            </TabsList>
                            <Separator />

                            <TabsContent
                                value="parameter"
                                className="flex-1 overflow-hidden data-[state=active]:flex flex-col"
                            >
                                <div className="h-full overflow-y-auto px-2 py-4">

                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="font-semibold text-lg text-gray-900 mb-4">Credentials</h4>
                                            <div className="space-y-4">
                                                <CredentialsSection
                                                    credentials={nodeData?.data?.credentials || []}
                                                    availableCredentials={credentials}
                                                    credentialId={nodeData?.credentialId || ""}
                                                    onCredentialChange={handleCredentialChange}
                                                    onCreateCredential={handleCreateCredential}
                                                />
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Dynamic Properties */}
                                        {Object.keys(nodeData?.data?.properties || {}).length > 0 && (
                                            <div>
                                                <h4 className="font-semibold text-lg text-gray-900 mb-4">Configuration</h4>
                                                <div className="space-y-4">
                                                    {Object.keys(nodeData?.data.properties || {}).map((key) => {
                                                        const property = nodeData?.data.properties[key]

                                                        if (property.type === 'notice') {
                                                            return (
                                                                <div key={key}>
                                                                    {renderProperty(property)}
                                                                </div>
                                                            )
                                                        }

                                                        return (
                                                            <div key={key} className="space-y-1">
                                                                <label className="text-sm font-medium text-gray-700 block">
                                                                    {property.displayName}
                                                                    {property.required && <span className="text-red-500 ml-1">*</span>}
                                                                </label>
                                                                <div className="w-full">
                                                                    {renderProperty(property)}
                                                                </div>
                                                                {property.description && (
                                                                    <p className="text-xs text-gray-500 mt-2">{property.description}</p>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent
                                value="settings"
                                className="flex-1 overflow-hidden data-[state=active]:flex flex-col"
                            >
                                <div className="h-full overflow-y-auto mt-4">
                                    <div className="max-w-3xl mx-auto space-y-6">
                                        {/* Header */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-muted">
                                                    <Settings className="w-5 h-5 text-foreground/80" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold tracking-tight">
                                                        Node Settings
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Configure node settings
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Settings */}

                                        <Field>
                                            <FieldLabel htmlFor="name-field">Name</FieldLabel>
                                            <Input
                                                id="name-field"
                                                type="text"
                                                placeholder="Enter name"
                                                value={nodeData?.data.label || ""}
                                                disabled
                                            />
                                        </Field>

                                        <Field>
                                            <FieldLabel htmlFor="description-field">Description</FieldLabel>
                                            <Input
                                                id="description-field"
                                                type="text"
                                                placeholder="Enter description"
                                                onChange={(e) => handleDescriptionChange(e.target.value)}
                                                value={node?.description || node?.data.nodeDefaultDescription}
                                            />
                                            <FieldDescription>
                                                Add a description for the node.
                                            </FieldDescription>
                                        </Field>


                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent
                                value="docs"
                                className="flex-1 overflow-hidden data-[state=active]:flex flex-col"
                            >
                                {nodeData?.name === "webhook" && (
                                    <WebhookDocs />
                                )}

                                {nodeData?.name === "manualTrigger" && (
                                    <ManualTriggerDocs />
                                )}

                                {nodeData?.name === "resend" && (
                                    <ResendDocs />
                                )}

                                {nodeData?.name === "telegram" && (
                                    <TelegramDocs />
                                )}

                                {nodeData?.name === "lmChatGoogleGemini" && (
                                    <GoogleGeminiChatDocs />
                                )}

                                {nodeData?.name === "agent" && (
                                    <AgentDocs />
                                )}

                            </TabsContent>
                        </Tabs>
                    </div>

                </div>

                <DialogFooter className="flex w-full justify-end ">
                    <DialogClose asChild>
                        <Button variant='outline'
                            onClick={() => { onClose() }}>Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild
                    >
                        <Button type='button' onClick={() => {
                            if (nodeData) {
                                onSave(nodeData)
                                onClose()
                            }
                        }}>
                            Save
                        </Button>
                    </DialogClose>
                </DialogFooter>

            </DialogContent>

            {selectedCredentialsType && (
                <CredentialConfigDrawer
                    isOpen={showCredentialsModal}
                    onClose={closeCredentialsModel}
                    credentialType={{
                        id: selectedCredentialsType,
                        displayName: availableCredentials.find(c => c.name === selectedCredentialsType)?.displayName || selectedCredentialsType,
                        properties: availableCredentials.find(c => c.name === selectedCredentialsType)?.properties || []
                    }}
                    projectId={projectId || undefined}
                />
            )}
        </Dialog>
    )
}
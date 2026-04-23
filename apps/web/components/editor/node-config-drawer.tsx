"use client";
import { getNodeMetadata, getTriggerNodeIcon } from "@/lib/node-registery";
import { Node, NodeName } from "@workspace/types";
import { Button } from "@workspace/ui/components/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { NodeIcon } from "../ui/node-icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Separator } from "@workspace/ui/components/separator";
import { BookOpen, ExternalLink, Settings } from "lucide-react";
import { Field, FieldDescription, FieldLabel } from "@workspace/ui/components/field";
import { useCallback, useEffect, useState } from "react";
import { useWorkflowStore } from "@/store/workflow";
import { getNodeCredentials } from "@/action/db/credentials";

type NodeConfigDrawerProps = {
    projectId: string;
    node: Node | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (nodeData: Node) => void;
}

interface CredentialRecord {
    id: string;
    name: string;
    type: string;
    data: unknown;
    projectId: string;
    createdAt: Date;
    updatedAt: Date;
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
        setNodeInputs(inputs);
    }, [nodeData, setNodeInputs, workflowStore]);

    const fetchCredentials = useCallback(async () => {
        if (!nodeData?.data.credentials || nodeData.data.credentials.length === 0) {
            return;
        }
        // const cred = await getNodeCredentials(nodeData.data.credentials || [], projectId);
        // setCredentials(cred);
    }, [nodeData, projectId]);

    const handleParametersChange = (key: string, value: string | number | boolean) => {
        if (!nodeData) return;

        workflowStore.nodeParameterChangeHandler(key, value);
        // setNodeData((prev: Node | null) => {
        //     if (!prev) return null;
        //     return {
        //         ...prev,
        //         parameters: {
        //             ...prev.parameters,
        //             [key]: value
        //         }
        //     }
        // })
    }

    // const nodeMetadata = getNodeMetadata(nodeData?.name as NodeName);
    const icon = getTriggerNodeIcon(nodeData?.name as NodeName);


    const renderProperty = (property: unknown) => {
        if (!property || typeof property !== 'object') return null

        // const prop = property as NodeProperty
        // const currentValue = nodeData?.parameters[prop?.name] || prop.default || ''

        return (
            <div></div>
            // <PropertyRenderer
            //     property={prop}
            //     value={currentValue}
            //     onChange={(value) => handleParameterChange(prop.name, value)}
            // />
        )
    }

    console.log(nodeData);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) onClose();
        }}>
            <DialogContent className='max-w-7xl flex flex-col' style={{ height: "80vh", overflowY: "hidden" }}>
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
                                                {nodeData?.name}
                                            </span>

                                        </div>
                                        <DialogDescription>
                                            {/* {nodeMetadata.description} */}
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

                <div className="w-full flex flex-1 min-h-0 gap-4">

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
                                <div className="h-full flex flex-col border rounded-lg">
                                    <div className="p-2 text-xl font-semibold shrink-0">
                                        Node Input
                                    </div>
                                    <Separator />

                                    {/* SCROLL AREA */}
                                    <div className="p-2 flex-1 flex items-center justify-center overflow-y-auto">
                                        long content
                                        No input data Present
                                    </div>

                                </div>
                            </TabsContent>

                            <TabsContent
                                value="output"
                                className="flex-1 overflow-hidden data-[state=active]:flex flex-col"
                            >
                                <div className="h-full flex flex-col border rounded-lg">
                                    <div className="p-2 text-xl font-semibold shrink-0">
                                        Node Output
                                    </div>
                                    <Separator />


                                    <div className="p-2 flex-1 overflow-y-auto">
                                        {/* output content */}
                                    </div>
                                </div>
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
                                <div className="h-full overflow-y-auto px-6 py-4">
                                    <div className="space-y-6">
                                        {/* <CredentialsSection
                                            credentials={nodeData?.data?.credentials || []}
                                            availableCredentials={credentials}
                                            credentialId={nodeData?.credentialId || ""}
                                            onCredentialChange={handleCredentialChange}
                                            onCreateCredential={handleCreateCredential}
                                        /> */}

                                        {/* Dynamic Properties */}
                                        {Object.keys(nodeData?.data?.properties || {}).length > 0 && (
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-4">Configuration</h4>
                                                <div className="space-y-6">
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
                                                            <div key={key} className="space-y-3">
                                                                <label className="text-sm font-medium text-gray-700 block">
                                                                    {property.displayName}
                                                                    {property.required && <span className="text-red-500 ml-1">*</span>}
                                                                </label>
                                                                <div className="w-full">
                                                                    {renderProperty(property)}
                                                                </div>
                                                                {property.description && (
                                                                    <p className="text-xs text-gray-500 mt-1">{property.description}</p>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        <div className="h-4"></div>
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
                                                // value={nodeMetadata.displayName}
                                                disabled
                                            />
                                        </Field>

                                        <Field>
                                            <FieldLabel htmlFor="description-field">Description</FieldLabel>
                                            <Input
                                                id="description-field"
                                                type="text"
                                                // placeholder={nodeMetadata.description}
                                                value={nodeData?.description || ""}
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
                                {/* {nodeMetadata.name === 'webhook' && (
                                    <WebhookDocs />
                                )} */}

                            </TabsContent>
                        </Tabs>
                    </div>

                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant='outline'>Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button type='button'>I Agree</Button>
                    </DialogClose>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    )
}


function WebhookDocs() {
    return (
        <div className="h-full overflow-y-auto mt-4">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                            <BookOpen className="w-5 h-5 text-foreground/80" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold tracking-tight">
                                Webhook Node Documentation
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Learn how to configure and use webhook triggers
                            </p>
                        </div>
                    </div>

                    <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                </div>

                {/* Intro */}
                <div className="text-sm text-muted-foreground leading-relaxed">
                    The Webhook node allows you to receive HTTP requests and trigger workflows
                    based on external events.
                </div>

                {/* Features */}
                <div className="rounded-xl border bg-background p-4 shadow-sm">
                    <h4 className="text-sm font-semibold mb-3 text-foreground">
                        Key Features
                    </h4>

                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                            Listen for HTTP requests (GET, POST, PUT, DELETE, etc.)
                        </li>
                        <li className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                            Handle different content types (JSON, form data, etc.)
                        </li>
                        <li className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                            Configure custom response behavior
                        </li>
                        <li className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                            Extract data from headers, query parameters, and body
                        </li>
                    </ul>
                </div>

                {/* Configuration */}
                <div className="rounded-xl border bg-background p-4 shadow-sm">
                    <h4 className="text-sm font-semibold mb-3 text-foreground">
                        Configuration
                    </h4>

                    <ul className="space-y-3 text-sm">
                        <li>
                            <span className="font-medium text-foreground">HTTP Method:</span>
                            <span className="text-muted-foreground"> Choose which HTTP methods to accept</span>
                        </li>
                        <li>
                            <span className="font-medium text-foreground">Path:</span>
                            <span className="text-muted-foreground"> Set a custom path for the webhook URL</span>
                        </li>
                        <li>
                            <span className="font-medium text-foreground">Authentication:</span>
                            <span className="text-muted-foreground"> Configure security if needed</span>
                        </li>
                    </ul>
                </div>

            </div>
        </div>
    )
}
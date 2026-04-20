"use client";

import { onDragStart } from "@/utils/drag-function";
import { Node, NodeName } from "@workspace/types";
import { Card, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { CircuitBoard, Mail, MousePointerClickIcon, Send, Webhook, Zap } from "lucide-react";
import { INodeIcon, NodeIcon } from "../ui/node-icon";
import { getNodeIcon } from "@/lib/node-registery";
import { PredefinedNodeMetaData } from "@workspace/node-base";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@workspace/ui/components/accordion";
import { useWorkflowStore } from "@/store/workflow";

type Props = {
    nodes: Node[];
}


export default function EditorSidebar({ nodes }: Props) {

    const nodesMetaData = PredefinedNodeMetaData;

    const getTriggerNodeIcon = (nodeName: NodeName): string | INodeIcon => {
        if (nodeName) {
            const registryIcon = getNodeIcon(nodeName);
            if (registryIcon) return registryIcon;
        }
        switch (nodeName) {
            case 'telegram':
                return { type: 'file' as const, value: 'telegram.svg' };
            case 'resend':
                return { type: 'url' as const, value: 'https://img.icons8.com/?size=100&id=nyD0PULzXd9Q&format=png&color=000000' };
            case 'agent':
                return { type: 'lucide' as const, value: 'Bot', color: 'purple' };
            case 'manualTrigger':
                return { type: 'file' as const, value: 'manualTrigger.svg' };
            case 'webhook':
                return { type: 'file' as const, value: 'webhook.svg' };
            default:
                return { type: 'lucide' as const, value: 'Zap', color: 'blue' };
        }
    };

    return (
        <aside>
            <Tabs
                defaultValue="actions"
                className="h-screen overflow-scroll pb-24 flex flex-col"
            >
                <TabsList className="bg-transparent">
                    <TabsTrigger value="actions">Actions</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <Separator />
                <TabsContent
                    value="actions"
                    className="flex flex-col gap-4 p-4"
                >
                    {Object.entries(nodesMetaData)
                        .filter(
                            ([nodeName, metaData]) =>
                                (!nodes.length && (metaData.nodeType === 'TRIGGER' || metaData.nodeType === 'WEBHOOK')) ||
                                (nodes.length && metaData.nodeType !== 'TRIGGER' && metaData.nodeType !== 'WEBHOOK')
                        )
                        .map(([nodeName, metaData]) => (
                            <Card
                                key={nodeName}
                                draggable
                                className="w-full cursor-grab border-black bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 p-0"
                                onDragStart={(event) => onDragStart(event, nodeName as NodeName)}
                            >
                                <CardHeader className="flex flex-row items-center gap-4 p-4">
                                    <NodeIcon
                                        icon={getTriggerNodeIcon(nodeName as NodeName)}
                                        size="md"
                                        className="text-primary"
                                    />
                                    <CardTitle className="text-md">
                                        {metaData.description.displayName}
                                        <CardDescription>{metaData.description.description}</CardDescription>
                                    </CardTitle>
                                </CardHeader>
                            </Card>
                        ))}
                </TabsContent>

                <TabsContent
                    value="settings"
                    className="-mt-6"
                >
                    <div className="p-2 text-center text-xl font-semibold">
                        {/* {currentNodeMetaData?.description.displayName} */}
                        Workfow Information
                    </div>

                    <Accordion type="multiple">
                        <AccordionItem
                            value="Options"
                            className="border-y px-2"
                        >
                            <AccordionTrigger className="no-underline!">
                                Credentials
                            </AccordionTrigger>
                            <AccordionContent>
                                {/* {CONNECTIONS.map((connection) => (
                                    <RenderConnectionAccordion
                                        key={connection.title}
                                        state={state}
                                        connection={connection}
                                    />
                                ))} */}
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem
                            value="Expected Output"
                            className="px-2"
                        >
                            <AccordionTrigger className="no-underline!">
                                Data
                            </AccordionTrigger>
                            {/* <RenderOutputAccordion
                                state={state}
                                nodeConnection={nodeConnection}
                            /> */}
                        </AccordionItem>
                    </Accordion>
                </TabsContent>
            </Tabs>
        </aside>
    )
}
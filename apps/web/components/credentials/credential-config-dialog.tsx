"use client";
import { NodeBaseProperties } from "@workspace/types";
import { Button } from "@workspace/ui/components/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Separator } from "@workspace/ui/components/separator";
import { useEffect, useMemo, useState } from "react";
import { NodeIcon } from "../ui/node-icon";
import { FieldRenderer } from "../ui/field-renderer";
import { Input } from "@workspace/ui/components/input";
import axios from "axios";

type NodeConfigDrawerProps = {
    isOpen: boolean
    onClose: () => void
    credentialType: {
        id: string
        displayName: string
        properties: NodeBaseProperties[]
    }
    projectId?: string
}

export default function CredentialConfigDrawer({
    isOpen,
    onClose,
    credentialType,
    projectId,
}: NodeConfigDrawerProps) {
    const defaultName = `${credentialType.displayName} account`;

    const [credentialData, setCredentialData] = useState<Record<string, any>>({});
    const [credentialName, setCredentialName] = useState(defaultName);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        setCredentialName(defaultName);
        setCredentialData({});
    }, [isOpen])

    const visibleFields = useMemo(
        () => credentialType.properties.filter((p) => p.type !== "HIDDEN"),
        [credentialType.properties]
    )

    const updateField = (name: string, value: any) => {
        setCredentialData((prev) => ({ ...prev, [name]: value }))
    }

    const resetState = () => {
        setCredentialData({})
        setCredentialName(defaultName)
    }

    const handleClose = () => {
        resetState()
        onClose()
    }

    const handleSave = async () => {
        setIsSaving(true)

        try {
            const payload = {
                name: credentialName,
                type: credentialType.id,
                data: credentialData,
                ...(projectId && { projectId }),
            }

            console.log("Payload: ", payload)

            const res = await axios.post(
                `/api/projects/${projectId}/credentials`,
                payload
            )

            if (!res.data.success) {
                throw new Error(res.data.message || "Failed to save credential")
            }

            handleClose()
        } catch (err) {
            console.error("Failed to save credential:", err)
        } finally {
            setIsSaving(false)
        }
    }

    const renderField = (property: NodeBaseProperties) => {
        const value = credentialData[property.name] || property.default || ""
        return (
            <FieldRenderer
                property={property}
                value={value}
                onChange={(value) => updateField(property.name, value)}
            />
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) onClose();
        }}>
            <DialogContent className='max-w-4xl flex flex-col p-0' style={{ height: "60vh", overflowY: "hidden" }}>
                <DialogHeader>
                    <DialogTitle className='border-b p-4'>
                        <div className="flex justify-between w-full pr-2">
                            <div className="flex justify-start items-center gap-4">
                                {/* image */}
                                <div className="flex items-center justify-center text-primary shrink-0">
                                    <NodeIcon
                                        icon={{ type: 'lucide' as const, value: 'KeySquare' }}
                                        size="lg"
                                        className="text-primary"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <span className="font-semibold text-2xl text-foreground truncate tracking-tight">
                                        {credentialType.displayName}
                                    </span>
                                    <DialogDescription className="text-gray-500 pt-4">
                                        Fill in the credentials for {credentialType.displayName}
                                    </DialogDescription>
                                </div>
                            </div>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="w-full flex flex-1 min-h-0 gap-4 px-4">

                    {/* parameter fields */}
                    <div className="w-full flex flex-col min-h-0 border rounded-lg p-4 overflow-y-auto">
                        <Tabs
                            defaultValue="connection"
                            className="flex flex-col h-full overflow-hidden"
                        >
                            <TabsList className="bg-transparent">
                                <TabsTrigger value="connection">Connections</TabsTrigger>
                                <TabsTrigger value="details">Details</TabsTrigger>
                            </TabsList>
                            <Separator />

                            <TabsContent
                                value="connection"
                                className="flex-1 overflow-hidden data-[state=active]:flex flex-col"
                            >
                                <div className="h-full overflow-y-auto px-2 py-4">

                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-lg text-gray-900">Configure Credential</h4>

                                        <Separator />

                                        <div className="space-y-6">

                                            {/* credential Name */}
                                            <div className="flex gap-2 flex-col">
                                                <label className="text-sm font-medium text-gray-700">Credential Name</label>
                                                <Input
                                                    value={credentialName}
                                                    onChange={(e) => setCredentialName(e.target.value)}
                                                    className="w-full"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Give your credential a recognizable name
                                                </p>
                                            </div>

                                            {credentialType.properties
                                                .filter(prop => prop.type !== "HIDDEN")
                                                .map((property) => (
                                                    <div key={property.name} className="flex gap-2 flex-col">
                                                        <label className="text-sm font-medium text-gray-700">
                                                            {property.displayName}
                                                            {property.required && (
                                                                <span className="text-red-500 ml-1">*</span>
                                                            )}
                                                        </label>
                                                        {renderField(property)}
                                                        {property.description && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {property.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>


                            <TabsContent
                                value="details"
                                className="flex-1 overflow-hidden data-[state=active]:flex flex-col"
                            >


                            </TabsContent>
                        </Tabs>
                    </div>

                </div>

                <DialogFooter className="flex w-full justify-end ">
                    <DialogClose asChild>
                        <Button variant='outline'
                            onClick={() => { handleClose() }}>Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild
                    >
                        <Button type='button' disabled={isSaving} onClick={() => { handleSave() }}>
                            {isSaving ? "Saving..." : "Save"}
                        </Button>
                    </DialogClose>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    )
}
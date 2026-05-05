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
import { toast } from "sonner";

type NodeConfigDrawerProps = {
    isOpen: boolean
    onClose: () => void
    credentialType: {
        id: string
        displayName: string
        properties: NodeBaseProperties[]
    }
    projectId?: string
    mode?: "create" | "edit"
    credentialId?: string
    initialName?: string
    onSaved?: () => void
}

export default function CredentialConfigDrawer({
    isOpen,
    onClose,
    credentialType,
    projectId,
    mode = "create",
    credentialId,
    initialName,
    onSaved,
}: NodeConfigDrawerProps) {
    const defaultName = initialName ?? `${credentialType.displayName} account`;
    const isEditMode = mode === "edit" && !!credentialId;

    const [credentialData, setCredentialData] = useState<Record<string, any>>({});
    const [credentialName, setCredentialName] = useState(defaultName);
    const [isSaving, setIsSaving] = useState(false);
    const [details, setDetails] = useState<{ createdAt: string; updatedAt: string } | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        setCredentialName(defaultName);
        setCredentialData({});
        setDetails(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, credentialId])

    useEffect(() => {
        if (!isOpen || !isEditMode || !projectId || !credentialId) return;

        let cancelled = false;
        setLoadingDetails(true);

        axios.get(`/api/projects/${projectId}/credentials/${credentialId}`)
            .then((res) => {
                if (!cancelled && res.data.success) {
                    setDetails({ createdAt: res.data.data.createdAt, updatedAt: res.data.data.updatedAt });
                }
            })
            .catch((err) => console.error("Failed to load credential details:", err))
            .finally(() => { if (!cancelled) setLoadingDetails(false); });

        return () => { cancelled = true; };
    }, [isOpen, isEditMode, projectId, credentialId])

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
            if (isEditMode) {
                // Only fields the user actually typed something into are
                // sent — an untouched (blank) field means "keep the current
                // value", since the existing secret is never sent back to
                // the browser to prefill.
                const changedData = Object.fromEntries(
                    Object.entries(credentialData).filter(([, value]) => value !== "" && value !== undefined && value !== null)
                );

                const payload: Record<string, unknown> = {};
                if (credentialName && credentialName !== defaultName) payload.name = credentialName;
                if (Object.keys(changedData).length > 0) payload.data = changedData;

                const res = await axios.patch(
                    `/api/projects/${projectId}/credentials/${credentialId}`,
                    payload
                )

                if (!res.data.success) {
                    throw new Error(res.data.message || "Failed to update credential")
                }

                toast.success("Credential updated")
            } else {
                const payload = {
                    name: credentialName,
                    type: credentialType.id,
                    data: credentialData,
                    ...(projectId && { projectId }),
                }

                const res = await axios.post(
                    `/api/projects/${projectId}/credentials`,
                    payload
                )

                if (!res.data.success) {
                    throw new Error(res.data.message || "Failed to save credential")
                }

                toast.success("Credential saved")
            }

            onSaved?.()
            handleClose()
        } catch (err) {
            console.error("Failed to save credential:", err)
            toast.error(err instanceof Error ? err.message : "Failed to save credential")
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
                                    <DialogDescription className="text-muted-foreground pt-4">
                                        {isEditMode
                                            ? `Update ${credentialType.displayName}. Leave a field blank to keep its current value.`
                                            : `Fill in the credentials for ${credentialType.displayName}`}
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
                                        <h4 className="font-semibold text-lg text-foreground">Configure Credential</h4>

                                        <Separator />

                                        <div className="space-y-6">

                                            {/* credential Name */}
                                            <div className="flex gap-2 flex-col">
                                                <label className="text-sm font-medium text-foreground/80">Credential Name</label>
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
                                                        <label className="text-sm font-medium text-foreground/80">
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
                                <div className="h-full overflow-y-auto px-2 py-4">
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-lg text-foreground">Credential Details</h4>
                                        <Separator />
                                        <dl className="space-y-4 text-sm">
                                            <div>
                                                <dt className="text-muted-foreground">Type</dt>
                                                <dd className="font-medium text-foreground">{credentialType.displayName}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-muted-foreground">Name</dt>
                                                <dd className="font-medium text-foreground">{credentialName}</dd>
                                            </div>
                                            {isEditMode ? (
                                                loadingDetails ? (
                                                    <p className="text-muted-foreground">Loading...</p>
                                                ) : details ? (
                                                    <>
                                                        <div>
                                                            <dt className="text-muted-foreground">Created</dt>
                                                            <dd className="font-medium text-foreground">
                                                                {new Date(details.createdAt).toLocaleString()}
                                                            </dd>
                                                        </div>
                                                        <div>
                                                            <dt className="text-muted-foreground">Last updated</dt>
                                                            <dd className="font-medium text-foreground">
                                                                {new Date(details.updatedAt).toLocaleString()}
                                                            </dd>
                                                        </div>
                                                    </>
                                                ) : null
                                            ) : (
                                                <p className="text-muted-foreground">Save this credential to see its creation date.</p>
                                            )}
                                        </dl>
                                        <p className="text-xs text-muted-foreground pt-2">
                                            Secret values are never shown here or sent back to the browser — only the credential's own metadata.
                                        </p>
                                    </div>
                                </div>
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
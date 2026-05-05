"use client";
import { getProjectCredentials } from "@/action/db/workflow";
import TabViewCard from "@/components/module/home/projects/tab-view-card";
import { CredentialTypePicker } from "@/components/credentials/credential-type-picker";
import CredentialConfigDrawer from "@/components/credentials/credential-config-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { availableCredentials } from "@/lib/credential-registry";
import { Button } from "@workspace/ui/components/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { MoreHorizontal, Pencil, ShieldX, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

type CredentialsType = {
    createdAt: string;
    updatedAt: string;
    id: string;
    name: string;
    type: string;
}

export default function ProjectCredentialsPage() {
    const [loading, setLoading] = useState(false);
    const [credentials, setCredentials] = useState<CredentialsType[]>([]);
    const { projectId }: { projectId: string } = useParams();

    const [isTypePickerOpen, setIsTypePickerOpen] = useState(false);
    type ConfigDrawerState = {
        type: { id: string; displayName: string; properties: typeof availableCredentials[number]["properties"] };
        mode: "create" | "edit";
        credentialId?: string;
        initialName?: string;
    };
    const [configDrawer, setConfigDrawer] = useState<ConfigDrawerState | null>(null);
    const [deletingCredential, setDeletingCredential] = useState<CredentialsType | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchCredentials = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getProjectCredentials(projectId);

            if (!res.success) throw new Error(res.message);

            setCredentials(res.credentials ?? []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchCredentials();
    }, [fetchCredentials]);

    const getCredentialDisplayName = (type: string) => {
        const match = availableCredentials.find((c) => c.name === type);
        return match?.displayName ?? type;
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

        if (diffInHours < 1) {
            return 'just now'
        } else if (diffInHours < 24) {
            return `${diffInHours} hours ago`
        } else {
            const diffInDays = Math.floor(diffInHours / 24)
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
        }
    }

    const formatCreatedDate = (dateString: string) => {
        return new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            timeZone: "UTC",
        }).format(new Date(dateString));
    };

    const openEdit = (credential: CredentialsType) => {
        const match = availableCredentials.find((c) => c.name === credential.type);
        setConfigDrawer({
            type: {
                id: credential.type,
                displayName: match?.displayName ?? credential.type,
                properties: match?.properties ?? [],
            },
            mode: "edit",
            credentialId: credential.id,
            initialName: credential.name,
        });
    };

    const handleDelete = async () => {
        if (!deletingCredential) return;
        setIsDeleting(true);
        try {
            const res = await axios.delete(`/api/projects/${projectId}/credentials/${deletingCredential.id}`);
            if (!res.data.success) throw new Error(res.data.message || "Failed to delete credential");
            toast.success("Credential deleted");
            setDeletingCredential(null);
            fetchCredentials();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete credential");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <TabViewCard >
            <Card className="bg-background/50 backdrop-blur-xl border-border/50">
                <CardHeader>
                    <CardTitle>Project Credentials</CardTitle>
                    <CardDescription>Manage keys and auth tokens scoped to this project.</CardDescription>
                    <CardAction>
                        <Button onClick={() => setIsTypePickerOpen(true)}>
                            Add Credentials
                        </Button>
                    </CardAction>
                </CardHeader>
                <CardContent className="min-h-75 flex items-center justify-center text-muted-foreground border-t border-border/50 bg-muted/5 p-4">

                    {/* 🔄 Loading State */}
                    {loading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full pt-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-16 rounded-xl bg-muted animate-pulse"
                                />
                            ))}
                        </div>
                    )}


                    {/* 📭 Empty State */}
                    {!loading && credentials.length === 0 && (
                        <div className="h-40 flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                            <div className="flex items-center gap-2">
                                <ShieldX className="w-6 h-6" />
                                <span>No credentials in this project yet.</span>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setIsTypePickerOpen(true)}>
                                Add your first credential
                            </Button>
                        </div>
                    )}

                    {!loading && credentials.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full pt-4">
                            {credentials.map((credential) => (
                                <div key={credential.id} className="flex items-center justify-between p-4 bg-background border border-border rounded-lg hover:border-primary/40 transition-colors">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="min-w-0">
                                            <h3 className="font-medium truncate">{credential.name}</h3>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                                                <span>{getCredentialDisplayName(credential.type)}</span>
                                                <span>|</span>
                                                <span>Last updated {formatDate(credential.updatedAt)}</span>
                                                <span>|</span>
                                                <span>Created {formatCreatedDate(credential.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEdit(credential)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => setDeletingCredential(credential)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>

                    )}

                </CardContent>
            </Card>

            <CredentialTypePicker
                isOpen={isTypePickerOpen}
                onClose={() => setIsTypePickerOpen(false)}
                onSelect={(type) => {
                    setIsTypePickerOpen(false);
                    setConfigDrawer({ type, mode: "create" });
                }}
            />

            {configDrawer && (
                <CredentialConfigDrawer
                    isOpen={!!configDrawer}
                    onClose={() => setConfigDrawer(null)}
                    credentialType={configDrawer.type}
                    projectId={projectId}
                    mode={configDrawer.mode}
                    credentialId={configDrawer.credentialId}
                    initialName={configDrawer.initialName}
                    onSaved={fetchCredentials}
                />
            )}

            <ConfirmDialog
                open={!!deletingCredential}
                onOpenChange={(open) => { if (!open) setDeletingCredential(null); }}
                title="Delete this credential?"
                description={`This permanently deletes "${deletingCredential?.name ?? "this credential"}". Any node still using it will stop working.`}
                confirmLabel="Delete Credential"
                isConfirming={isDeleting}
                onConfirm={handleDelete}
            />
        </TabViewCard>
    )
}

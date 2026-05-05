"use client";
import { motion } from "framer-motion";
import { getAllCredentials } from "@/lib/db-calls";
import { CredentialsPageReturnType } from "@workspace/types";
import { useSession } from "@/lib/auth-client";
import { useCallback, useEffect, useState } from "react"
import { Hash, Key, Layers, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { CredentialTypePicker } from "@/components/credentials/credential-type-picker";
import CredentialConfigDrawer from "@/components/credentials/credential-config-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { availableCredentials } from "@/lib/credential-registry";
import axios from "axios";
import { toast } from "sonner";

type CredentialRow = CredentialsPageReturnType["credentials"][number];

type ConfigDrawerState = {
    projectId: string;
    type: { id: string; displayName: string; properties: typeof availableCredentials[number]["properties"] };
    mode: "create" | "edit";
    credentialId?: string;
    initialName?: string;
};

export default function CredentialsCards() {
    const session = useSession();
    const [projects, setProjects] = useState<CredentialsPageReturnType[]>([]);
    const [configDrawer, setConfigDrawer] = useState<ConfigDrawerState | null>(null);
    const [typePickerForProject, setTypePickerForProject] = useState<string | null>(null);
    const [deletingCredential, setDeletingCredential] = useState<{ projectId: string; credential: CredentialRow } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const userId = session.data?.user.id;

    const fetchCredentials = useCallback(async () => {
        if (!userId) return;
        const response = await getAllCredentials(userId);
        setProjects(response || []);
    }, [userId]);

    useEffect(() => {
        fetchCredentials();
    }, [fetchCredentials]);

    const openEdit = (projectId: string, credential: CredentialRow) => {
        const match = availableCredentials.find((c) => c.name === credential.type);
        setConfigDrawer({
            projectId,
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
            const res = await axios.delete(
                `/api/projects/${deletingCredential.projectId}/credentials/${deletingCredential.credential.id}`
            );
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

    if (!session || !session.data) return null;

    if (projects.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border/50 rounded-2xl">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                        <Layers className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold tracking-tight">No Credentials Available</h3>
                    <p className="mb-6 mt-2 text-muted-foreground max-w-sm">
                        No credentials found in your projects.<br /> Add credentials to start using integrations.
                    </p>
                </div>
            </motion.div>
        )
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.4, duration: 0.2 }}
                className="flex flex-col gap-4 ml-4"
            >
                {projects.map((project) => (
                    <motion.div
                        key={project.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                    >
                        <CredentialsBlock
                            project={project}
                            onAdd={() => setTypePickerForProject(project.id)}
                            onEdit={(credential) => openEdit(project.id, credential)}
                            onDelete={(credential) => setDeletingCredential({ projectId: project.id, credential })}
                        />
                    </motion.div>
                ))}
            </motion.div>

            <CredentialTypePicker
                isOpen={!!typePickerForProject}
                onClose={() => setTypePickerForProject(null)}
                onSelect={(type) => {
                    if (!typePickerForProject) return;
                    setConfigDrawer({ projectId: typePickerForProject, type, mode: "create" });
                    setTypePickerForProject(null);
                }}
            />

            {configDrawer && (
                <CredentialConfigDrawer
                    isOpen={!!configDrawer}
                    onClose={() => setConfigDrawer(null)}
                    credentialType={configDrawer.type}
                    projectId={configDrawer.projectId}
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
                description={`This permanently deletes "${deletingCredential?.credential.name ?? "this credential"}". Any node still using it will stop working.`}
                confirmLabel="Delete Credential"
                isConfirming={isDeleting}
                onConfirm={handleDelete}
            />
        </>
    )
}

const formatDate = (dateString: Date | null) => {
    if (!dateString) return '—';

    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
        return 'Just now';
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes} min ago`;
    } else if (diffInMinutes < 24 * 60) {
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
};

function CredentialsBlock({
    project,
    onAdd,
    onEdit,
    onDelete,
}: {
    project: CredentialsPageReturnType;
    onAdd: () => void;
    onEdit: (credential: CredentialRow) => void;
    onDelete: (credential: CredentialRow) => void;
}) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="h-full"
        >
            <Card className="bg-background/50 backdrop-blur-xl border-border/50">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Layers className="h-5 w-5 text-primary" />
                        <CardTitle>{project.name}</CardTitle>
                        <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded-md border border-border/40">
                            <Hash className="h-3 w-3" />
                            <span className="truncate max-w-20">{project.id}</span>
                        </div>
                    </div>
                    <CardDescription>{project.description || "--"}</CardDescription>
                    <CardAction>
                        <Button onClick={onAdd}>
                            Add credential
                        </Button>
                    </CardAction>
                </CardHeader>
                <CardContent className="min-h-75 flex items-center justify-center border-t border-border/50 bg-muted/5 p-0">
                    <div className=" rounded-lg overflow-hidden w-full">
                        <table className="w-full table-fixed">

                            <thead className="bg-muted/40 border-b border-border/50">
                                <tr>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">SERVICE</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">TYPE</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ADDED ON</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {
                                    project.credentials.map((credential) => (
                                        <tr key={credential.id} className="hover:bg-muted/30">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Key className="w-4 h-4" />
                                                    <span className="text-sm">{credential.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded-md border border-border/40">
                                                    <Hash className="h-3 w-3" />
                                                    <span className="truncate max-w-10">
                                                        {credential.id}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-muted-foreground">
                                                    {credential.type}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-muted-foreground">
                                                        {formatDate(credential.updatedAt)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => onEdit(credential)}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => onDelete(credential)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

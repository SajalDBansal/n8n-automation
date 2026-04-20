"use client";
import { motion } from "framer-motion";
import { getAllCredentials } from "@/lib/db-calls";
import { CredentialsPageReturnType } from "@workspace/types";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react"
import { Hash, Key, Layers, MoreHorizontal } from "lucide-react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";

export default function CredentialsCards() {
    const session = useSession();
    const [projects, setProjects] = useState<CredentialsPageReturnType[]>([]);

    const userId = session.data?.user.id;

    useEffect(() => {
        if (!userId) return;

        const run = async () => {
            const response = await getAllCredentials(userId);
            setProjects(response || []);
        }

        run();
    }, [userId]);

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
                    <CredentialsBlock project={project} />
                </motion.div>
            ))}
        </motion.div>
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

function CredentialsBlock({ project }: { project: CredentialsPageReturnType }) {
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
                        <Link href={""}>
                            <Button>
                                Add credential
                            </Button>
                        </Link>
                    </CardAction>
                </CardHeader>
                <CardContent className="min-h-75 flex items-center justify-center border-t border-border/50 bg-muted/5 p-0">
                    <div className=" rounded-lg overflow-hidden w-full">
                        <table className="w-full table-fixed">

                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">SERVICE</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">ID</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">TYPE</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">ADDED ON</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {
                                    project.credentials.map((credential) => (
                                        <tr key={credential.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Key className="w-4 h-4" />
                                                    <span className="text-sm text-gray-900">{credential.name}</span>
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
                                                <span className="text-sm text-gray-600">
                                                    {credential.type}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-600">
                                                        {formatDate(credential.updatedAt)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
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
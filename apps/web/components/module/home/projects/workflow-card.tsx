import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardFooter, CardHeader } from "@workspace/ui/components/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu";
import { motion } from "framer-motion";
import { CircleCheck, Clock, FolderOpen, Hash, Layers, MoreVertical, Pause, Pencil, Play, Settings, Trash2, TriangleAlert } from "lucide-react";
import Link from "next/link";

interface WorkflowCardProps {
    id: string;
    projectId: string;
    name: string;
    description?: string;
    isActive: boolean;
    updatedAt: Date;
    projectName?: string
}

export function WorkflowCard({ id, projectId, name, description, isActive, updatedAt, projectName }: WorkflowCardProps) {
    const formattedDate = new Date(updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    return (
        <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="h-full"
        >
            <Card className="flex flex-col h-full bg-background/50 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-colors group relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className="space-y-1">
                        <div className="flex gap-3">
                            <h3 className="font-semibold text-base tracking-tight">{name}</h3>
                            <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded-md border border-border/40">
                                <Hash className="h-3 w-3" />
                                <span className="truncate max-w-20">{id}</span>
                            </div>
                        </div>
                        {description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>
                        )}
                    </div>


                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <div className="h-8 w-8 -mr-2 -mt-2 text-muted-foreground hover:text-foreground flex items-center justify-center">
                                <MoreVertical className="h-4 w-4" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <Link href={`/projects/${projectId}/${id}`}>
                                <DropdownMenuItem >
                                    <FolderOpen className="mr-2 h-4 w-4" />
                                    Open Workflow
                                </DropdownMenuItem>
                            </Link>
                            <Link href={`/projects/${projectId}/${id}/edit`}>
                                <DropdownMenuItem>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <Link href={`/projects/${projectId}/${id}/settings`}>
                                <DropdownMenuItem
                                    className="text-destructive"
                                >
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>

                                </DropdownMenuItem>
                            </Link>
                        </DropdownMenuContent>
                    </DropdownMenu>

                </CardHeader>

                <CardContent className="flex-1 pb-4 flex gap-3 items-center ">

                    {projectName && (
                        <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded-md border border-border/40">
                            <Layers className="h-3 w-3" />
                            <span>{projectName}</span>
                        </div>
                    )}

                    {isActive == true ? (
                        <div className="flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded-md border font-medium bg-green-500/40 text-green-500 border-green-500/20">
                            <CircleCheck className="h-3 w-3" />
                            <span className="truncate max-w-20">Active</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded-md border  font-medium bg-destructive/10 text-destructive border-destructive/20">
                            <TriangleAlert className="h-3 w-3" />
                            <span className="truncate max-w-20">Inactive</span>
                        </div>
                    )}

                </CardContent>

                <CardFooter className="pt-4 border-t border-border/50 flex items-center justify-between bg-muted/10">
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Last update: {formattedDate}</span>
                    </div>
                    <Link href={`/projects/${projectId}/${id}/edit`}>
                        <Button variant="ghost" size="sm" className="h-8 gap-1 hover:text-primary transition-colors">
                            <Play className="h-3 w-3" />
                            Open
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </motion.div>
    );
}

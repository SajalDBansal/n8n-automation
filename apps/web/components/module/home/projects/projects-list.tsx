"use client";
import { deleteProjectOptimistic } from "@/action/client/project";
import { useProjectStore } from "@/store/projects";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardFooter, CardHeader } from "@workspace/ui/components/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu";
import { motion } from "framer-motion";
import { Calendar, ExternalLink, FolderOpen, Hash, Layers, MoreVertical, Pencil, Plus, Trash2, Waypoints } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ProjectsCard() {
    const { projects } = useProjectStore();

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    if (projects === null || projects.length === 0) {
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
                    <h3 className="text-xl font-semibold tracking-tight">No projects yet</h3>
                    <p className="mb-6 mt-2 text-muted-foreground max-w-sm">
                        You haven't created any projects. Group your workflows together by creating your first project.
                    </p>
                    <Button className="rounded-xl">
                        <Link href="/projects/new" className="flex items-center justify-center">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Project
                        </Link>
                    </Button>
                </div>
            </motion.div>
        )
    }

    const handleDelete = async (id: string, workflowCount: number) => {
        if (workflowCount > 0) {
            toast.error("Cannot delete project with workflows.");
            return;
        }
        await deleteProjectOptimistic(id, false);
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
            {projects.map((project) => (
                <motion.div key={project.id} variants={item}>
                    <ProjectCard
                        id={project.id}
                        name={project.name}
                        description={project.description || "No description provided."}
                        workflowCount={project.workflows?.length || 0}
                        createdAt={project.createdAt}
                        onDelete={handleDelete}
                    />
                </motion.div>
            ))}
        </motion.div>


    )
}

type ProjectCardProps = {
    id: string;
    name: string;
    description?: string;
    workflowCount: number;
    createdAt: string;
    onDelete: (id: string, workflowCount: number) => void;
}

export function ProjectCard({ id, name, description, workflowCount, createdAt, onDelete }: ProjectCardProps) {


    const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
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
            <Card className="flex flex-col h-full bg-background/60 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-md hover:border-primary/40 focus-within:border-primary/40 transition-all duration-300 group relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                <CardHeader className="flex flex-row items-start justify-between pb-2 z-10">
                    <div className="flex items-center gap-3">
                        <Layers className="h-5 w-5 text-primary" />

                        <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded-md border border-border/40">
                            <Hash className="h-3 w-3" />
                            <span className="truncate max-w-20">{id}</span>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <div className="h-8 w-8 -mr-2 -mt-2 text-muted-foreground hover:text-foreground flex items-center justify-center">
                                <MoreVertical className="h-4 w-4" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <Link href={`/projects/${id}`}>
                                <DropdownMenuItem >
                                    <FolderOpen className="mr-2 h-4 w-4" />
                                    Open Project
                                </DropdownMenuItem>
                            </Link>
                            <Link href={`/projects/${id}/settings`}>
                                <DropdownMenuItem>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit Details
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onDelete(id, workflowCount)}
                                className="text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete Project</span>

                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>

                <CardContent className="flex-1 z-10 flex flex-col">
                    <Link href={`/projects/${id}`} className="space-y-1.5 outline-none group-focus-visible:ring-2 ring-primary ring-offset-2 ring-offset-background rounded-md flex-1 mt-2">
                        <h3 className="font-bold text-xl tracking-tight text-foreground/90 group-hover:text-primary transition-colors">{name}</h3>
                        {description ? (
                            <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed">{description}</p>
                        ) : (
                            <p className="text-sm text-muted-foreground/50 italic">No description provided.</p>
                        )}
                    </Link>

                    <div className="flex flex-wrap items-center gap-2 mt-5">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 transition-colors group-hover:bg-primary/15 whitespace-nowrap">
                            <Waypoints className="h-3.5 w-3.5" />
                            <span>{workflowCount} {workflowCount === 1 ? 'Workflow' : 'Workflows'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-full border border-border/40 whitespace-nowrap">
                            <Calendar className="h-3.5 w-3.5 opacity-70" />
                            <span>{formattedDate}</span>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="pt-3 pb-3 border-t border-border/40 bg-muted/10 flex items-center justify-between z-10">
                    <Link href={`/projects/${id}/workflows`}>
                        <Button variant="secondary" className="justify-between hover:bg-secondary/80 transition-all duration-200 group/btn shadow-sm" >
                            <span className="font-medium text-sm">Open Workflows</span>
                            <ExternalLink className="h-4 w-4 opacity-70 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-all duration-200" />
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
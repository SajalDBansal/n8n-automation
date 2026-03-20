"use client"
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Layers, Loader2, Plus, Trash } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { Form } from "@workspace/ui/components/form";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProjectFormZodSchema } from "@workspace/validators";
import { CreateProjectFormValues, ProjectType } from "@workspace/types";
import { useRouter } from "next/navigation";
import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Input } from "@workspace/ui/components/input";
import { deleteProjectOptimistic, updateProjectOptimistic } from "@/action/client/project";
import { useProjectStore } from "@/store/projects";
import { useEffect, useState } from "react";

export default function UpdateProjectCard({ projectId }: { projectId: string }) {
    const router = useRouter();
    const { projects } = useProjectStore();
    const [project, setProject] = useState<ProjectType | null>(null);

    const currentProject = projects?.find((p) => p.id === projectId) ?? null;

    const form = useForm<CreateProjectFormValues>({
        resolver: zodResolver(createProjectFormZodSchema),
        defaultValues: {
            name: "",
            description: "",
            type: "PERSONAL"
        },
    });

    useEffect(() => {
        if (currentProject) {
            setProject(currentProject);
            form.reset({
                name: currentProject.name,
                description: currentProject.description || "",
                type: currentProject.type ?? "PERSONAL"
            });
        }
    }, [currentProject, form]);

    async function onSubmit(data: CreateProjectFormValues) {
        await updateProjectOptimistic(projectId, data);
        router.push(`/projects/${projectId}`);
    }

    async function handleProjectDelete() {
        await deleteProjectOptimistic(projectId, true);
        router.push(`/projects`);
    }


    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
        >
            {!project && (
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
            )}

            {project && (
                <div className="flex flex-col sm:gap-2 gap-6">
                    <Card className="bg-background/50 backdrop-blur-xl border-border/50 h-full">
                        <CardHeader>
                            <CardTitle>Project Details</CardTitle>
                            <CardDescription>Provide a name and other details for the project.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col justify-between h-full">

                            <Form {...form}>
                                <form className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Controller
                                            name="name"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid} className="gap-1">
                                                    <FieldLabel htmlFor="create-project-form-name" className="gap-1">
                                                        Project Name <span className="text-destructive">*</span>
                                                    </FieldLabel>
                                                    <Input
                                                        {...field}
                                                        id="create-project-form-name"
                                                        aria-invalid={fieldState.invalid}
                                                        placeholder="e.g. Marketing Automation"
                                                        autoComplete="off"
                                                        type="text"
                                                    />
                                                    <FieldDescription>
                                                        Enter your desired project name.
                                                    </FieldDescription>
                                                    {fieldState.invalid && (
                                                        <FieldError errors={[fieldState.error]} />
                                                    )}
                                                </Field>
                                            )}
                                        />

                                        <Controller
                                            name="type"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid} className="gap-1">
                                                    <FieldLabel htmlFor="create-project-form-name" className="gap-1">
                                                        Type <span className="text-destructive">*</span>
                                                    </FieldLabel>
                                                    <Select value={field.value} onValueChange={field.onChange}>
                                                        <SelectTrigger aria-invalid={fieldState.invalid}>
                                                            <SelectValue placeholder="Select a type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectItem value="PERSONAL">Personal</SelectItem>
                                                                <SelectItem value="TEAM">Team</SelectItem>
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                    <FieldDescription>
                                                        Select the desired Project type.
                                                    </FieldDescription>
                                                    {fieldState.invalid && (
                                                        <FieldError errors={[fieldState.error]} />
                                                    )}
                                                </Field>
                                            )}
                                        />

                                    </div>


                                    <Controller
                                        name="description"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid} className="gap-1">
                                                <FieldLabel htmlFor="create-project-form-name" className="gap-1">
                                                    Description
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    id="create-project-form-name"
                                                    aria-invalid={fieldState.invalid}
                                                    placeholder="What is this project about?"
                                                    autoComplete="off"
                                                    type="text"
                                                />
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]} />
                                                )}
                                            </Field>
                                        )}
                                    />

                                </form>
                            </Form>

                        </CardContent>

                        <CardFooter className="flex justify-end gap-3 border-t pt-3">
                            <Link href={"/projects"}>
                                <Button variant="outline" type="button" className="rounded-xl">
                                    Cancel
                                </Button>
                            </Link>
                            <Button
                                onClick={form.handleSubmit(onSubmit)}
                                type="submit"
                                className="rounded-xl"
                                disabled={
                                    form.formState.isSubmitting ||
                                    !form.formState.isDirty
                                }
                            >
                                {form.formState.isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
                                ) : (
                                    "Update Project"
                                )}
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="bg-background/50 backdrop-blur-xl border-border/50 h-full">
                        <CardHeader>
                            <CardTitle>Danger Zoney</CardTitle>
                            <CardDescription>Permanently delete this project and all associated data. This action cannot be undone.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col justify-between h-full">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/5 border border-destructive/30">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-destructive/10 rounded-lg">
                                        <Trash className="h-5 w-5 text-destructive" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-destructive">Delete Project</h4>
                                        <p className="text-sm text-destructive">
                                            Permanently delete this project and all its workflows. This action cannot be undone.
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="rounded-lg cursor-pointer"
                                    onClick={handleProjectDelete}
                                >
                                    Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            )}

        </motion.div>
    )
}
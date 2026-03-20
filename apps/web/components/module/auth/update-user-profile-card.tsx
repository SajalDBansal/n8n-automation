"use client"
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Loader2, Shield, Smartphone, Trash } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { Form } from "@workspace/ui/components/form";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProjectFormZodSchema } from "@workspace/validators";
import { CreateProjectFormValues } from "@workspace/types";
import { useRouter } from "next/navigation";
import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Input } from "@workspace/ui/components/input";
import { createProjectOptimistic } from "@/action/client/project";
import { useSession } from "next-auth/react";

export default function UpdateProfileCard() {
    const router = useRouter();

    const form = useForm<CreateProjectFormValues>({
        resolver: zodResolver(createProjectFormZodSchema),
        defaultValues: {
            name: "",
            description: "",
            type: "PERSONAL"
        },
    });

    async function onSubmit(data: CreateProjectFormValues) {
        await createProjectOptimistic(data);
        router.push("/projects");
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
            className="grid gap-3"
        >
            <Card className="bg-background/50 backdrop-blur-xl border-border/50">
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
                        className="rounded-xl" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
                        ) : (
                            "Save Project"
                        )}
                    </Button>
                </CardFooter>
            </Card>

            <Card className="bg-background/50 backdrop-blur-xl border-border/50">
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Manage your password and security modes.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2">
                    <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-background/30">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Shield className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-medium">Password</h4>
                                <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-lg">Change</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-background/30">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Smartphone className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-medium">Two-factor Authentication</h4>
                                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-lg">Enable</Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-background/50 backdrop-blur-xl border-border/50 h-full">
                <CardHeader>
                    <CardTitle>Danger Zone</CardTitle>
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
                        // onClick={handleProjectDelete}
                        >
                            Delete
                        </Button>
                    </div>
                </CardContent>
            </Card>

        </motion.div>
    )
}
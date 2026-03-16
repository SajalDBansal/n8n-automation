"use client"
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Loader2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { Form } from "@workspace/ui/components/form";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createWorkflowFormZodSchema } from "@workspace/validators";
import { CreateWorkflowFormValues } from "@workspace/types";
import { useRouter } from "next/navigation";
import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Input } from "@workspace/ui/components/input";
import { createWorkflowOptimistic } from "@/action/client/workflow";

export default function CreateWorkflowCard({ projectId }: { projectId: string }) {
    const router = useRouter();

    const form = useForm<CreateWorkflowFormValues>({
        resolver: zodResolver(createWorkflowFormZodSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    async function onSubmit(data: CreateWorkflowFormValues) {
        await createWorkflowOptimistic(projectId, data);
        router.push(`/projects/${projectId}`);
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
            <Card className="bg-background/50 backdrop-blur-xl border-border/50 h-full">
                <CardHeader>
                    <CardTitle>Workflow Details</CardTitle>
                    <CardDescription>Provide a name and other details for the workflow.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col justify-between h-full">

                    <Form {...form}>
                        <form className="space-y-4">

                            <Controller
                                name="name"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="gap-1">
                                        <FieldLabel htmlFor="create-workflow-form-name" className="gap-1">
                                            Workflow Name <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="create-workflow-form-name"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="e.g. User Onboarding"
                                            autoComplete="off"
                                            type="text"
                                        />
                                        <FieldDescription>
                                            Enter your desired workflow name.
                                        </FieldDescription>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="description"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="gap-1">
                                        <FieldLabel htmlFor="create-workflow-form-name" className="gap-1">
                                            Description
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="create-workflow-form-name"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="What is this workflow about?"
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
                    <Link href={`/projects/${projectId}`}>
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
                            "Create Workflow"
                        )}
                    </Button>
                </CardFooter>
            </Card>

        </motion.div>
    )
}
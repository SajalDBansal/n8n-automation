"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthCard } from "@/components/module/auth/auth-card";
import { Form } from "@workspace/ui/components/form";
import { Button } from "@workspace/ui/components/button";
import { resetPasswordZodSchema } from "@workspace/validators";
import { ResetPasswordFormValues } from "@workspace/types";
import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { toast } from "sonner";

export default function ResetPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { token }: { token: string } = useParams();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
    const [error, setError] = useState<string | null>(null);

    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordZodSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
            token: token
        },
    });

    async function onSubmit(data: ResetPasswordFormValues) {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch("/api/auth/password/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                console.error(result.message);
                setError(result.message);
                return;
            }

            toast.success(`Password updated successfully...`);

            router.push(`/login`)

        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <AuthCard
            title="Create new password"
            error={error != null ? error : ""}
            description="Your new password must be different from previous used passwords."
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <Controller
                        name="password"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="signup-form-password">
                                    Password
                                </FieldLabel>
                                <div className="relative">
                                    <Input
                                        {...field}
                                        id="signup-form-password"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="••••••••••••••••"
                                        autoComplete="password"
                                        type={isPasswordVisible ? 'text' : 'password'}
                                    />
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        type={"button"}
                                        onClick={() => setIsPasswordVisible(prevState => !prevState)}
                                        className='text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent'
                                    >
                                        {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                                        <span className='sr-only'>{isPasswordVisible ? 'Hide password' : 'Show password'}</span>
                                    </Button>
                                </div>
                                <FieldDescription>
                                    Must be at least 8 characters long.
                                </FieldDescription>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                    <Controller
                        name="confirmPassword"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="signup-form-confirmPassword">
                                    Confirm Password
                                </FieldLabel>
                                <div className="relative">
                                    <Input
                                        {...field}
                                        id="signup-form-confirmPassword"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="••••••••••••••••"
                                        autoComplete="password"
                                        type={isConfirmPasswordVisible ? 'text' : 'password'}
                                    />
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        type={"button"}
                                        onClick={() => setIsConfirmPasswordVisible(prevState => !prevState)}
                                        className='text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent'
                                    >
                                        {isConfirmPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                                        <span className='sr-only'>{isConfirmPasswordVisible ? 'Hide password' : 'Show password'}</span>
                                    </Button>
                                </div>
                                <FieldDescription>
                                    Please confirm your password.
                                </FieldDescription>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                    <Button
                        type="submit"
                        className="w-full rounded-xl mt-6 relative overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
                        ) : (
                            "Reset Password"
                        )}
                    </Button>
                </form>
            </Form>
        </AuthCard>
    )
}
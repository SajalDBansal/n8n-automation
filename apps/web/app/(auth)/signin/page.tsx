"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { AuthCard } from "@/components/module/auth/auth-card";
import { Form } from "@workspace/ui/components/form";
import { Button } from "@workspace/ui/components/button";
import { signinZodSchema } from "@workspace/validators";
import { SigninFormValues } from "@workspace/types";
import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function signinPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)
    const router = useRouter();

    const form = useForm<SigninFormValues>({
        resolver: zodResolver(signinZodSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(data: SigninFormValues) {
        try {
            setIsLoading(true);

            const response = await signIn("credentials", {
                ...data, redirect: false
            })

            if (!response || response?.error) {
                console.error("Login Failed", response?.error);
            }

            router.replace(`/dashboard`)

        } catch (error) {
            console.log(error);
        } finally {

            setIsLoading(false);
        }

    }
    return (
        <AuthCard
            title="Welcome back"
            description="Enter your credentials to access your account"
            footer={
                <div className="w-full text-center text-sm text-muted-foreground mt-1">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/signup"
                        className="text-primary hover:underline hover:text-primary/80 font-medium transition-colors"
                    >
                        Create Account
                    </Link>
                </div>
            }
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <Controller
                        name="email"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="signin-form-email">
                                    Email
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="signin-form-email"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="m@example.com"
                                    autoComplete="off"
                                    type="email"
                                />
                                <FieldDescription>
                                    Enter your register email address.
                                </FieldDescription>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                    <Controller
                        name="password"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="signin-form-password">
                                    Password
                                </FieldLabel>
                                <div className="relative">
                                    <Input
                                        {...field}
                                        id="signin-form-password"
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
                    <Button
                        type="submit"
                        className="w-full rounded-xl mt-6 relative overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                </form>
            </Form>
        </AuthCard>
    )
}
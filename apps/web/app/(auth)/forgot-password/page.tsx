"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/module/auth/auth-card";
import { Form } from "@workspace/ui/components/form";
import { Button } from "@workspace/ui/components/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { resendOTPZodSchema } from "@workspace/validators";
import { SendOtpFormValues } from "@workspace/types";
import { toast } from "sonner";

export default function SendOTPPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const form = useForm<SendOtpFormValues>({
        resolver: zodResolver(resendOTPZodSchema),
        defaultValues: {
            email: "",
        },
    });

    async function onSubmit(data: SendOtpFormValues) {
        try {
            setIsLoading(true);

            const response = await fetch("/api/auth/password/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                console.error(result.message);
                return;
            }

            toast.success(`Password Reset link send to email Address`, {
                description: "Email service is temprarily down so you are directed directly"
            });

            router.push(`/reset-password/${result.resetLink}`)

        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthCard
            title="Reset your password"
            description="Enter your email to receive a verification code"
            footer={
                <div className="w-full text-center text-sm text-muted-foreground mt-4">
                    Remember your password?{" "}
                    <Link
                        href="/login"
                        className="text-primary hover:underline hover:text-primary/80 font-medium transition-colors"
                    >
                        Sign In
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
                                <FieldLabel htmlFor="reset-otp-email">
                                    Email
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="reset-otp-email"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="m@example.com"
                                    autoComplete="off"
                                    type="email"
                                />
                                <FieldDescription>
                                    We'll use this to contact you. We will not share your email with anyone else.
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
                            "Send Verification Code"
                        )}
                    </Button>
                </form>
            </Form>
        </AuthCard>
    )
}
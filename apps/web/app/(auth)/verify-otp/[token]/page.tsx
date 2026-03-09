"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AuthCard } from "@/components/module/auth/auth-card";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@workspace/ui/components/input-otp";
import { Button } from "@workspace/ui/components/button";
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { verifyOTPZodSchema } from "@workspace/validators";
import { VerifyOtpFormValues } from "@workspace/types";
import { Form } from "@workspace/ui/components/form";
import { toast } from "sonner";

export default function VerifyOTPPage() {
    const { token }: { token: string } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "your email";
    const otp = searchParams.get("otp") || "------";
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        toast.success(`Your login OTP is ${otp}`, {
            description: () => <div className="text-muted-foreground">
                "Email service is temprarily down so otp is showed on screen"
            </div>
        });
    }, [otp]);

    const form = useForm<VerifyOtpFormValues>({
        resolver: zodResolver(verifyOTPZodSchema),
        defaultValues: {
            otp: "",
            token: token
        },
    });

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timerId = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timerId);
    }, [timeLeft]);

    const handleResend = () => {

    };

    async function onSubmit(data: VerifyOtpFormValues) {

        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch("/api/auth/otp/verify-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                console.log(result.message);
                setError(result.message);
                return;
            }

            toast.success(`Your verified Successfullt`);

            router.replace(`/signin`);

        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthCard
            title="Verify your email"
            error={error != null ? error : ""}
            description={`We sent a verification code to ${email}`}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Controller
                        name="otp"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} className="space-y-3 relative flex flex-col items-center">
                                <FieldLabel htmlFor="verify-otp">
                                    One-Time Password
                                </FieldLabel>
                                <div className="flex items-center justify-center">
                                    <InputOTP maxLength={6} {...field} disabled={isLoading}>
                                        <InputOTPGroup>
                                            <InputOTPSlot index={0} className="w-12 h-14 text-lg bg-background/50 backdrop-blur-sm focus-visible:ring-primary/50" />
                                            <InputOTPSlot index={1} className="w-12 h-14 text-lg bg-background/50 backdrop-blur-sm focus-visible:ring-primary/50" />
                                            <InputOTPSlot index={2} className="w-12 h-14 text-lg bg-background/50 backdrop-blur-sm focus-visible:ring-primary/50" />
                                        </InputOTPGroup>
                                        <InputOTPSeparator />
                                        <InputOTPGroup>
                                            <InputOTPSlot index={3} className="w-12 h-14 text-lg bg-background/50 backdrop-blur-sm focus-visible:ring-primary/50" />
                                            <InputOTPSlot index={4} className="w-12 h-14 text-lg bg-background/50 backdrop-blur-sm focus-visible:ring-primary/50" />
                                            <InputOTPSlot index={5} className="w-12 h-14 text-lg bg-background/50 backdrop-blur-sm focus-visible:ring-primary/50" />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    <Button
                        type="submit"
                        size={"lg"}
                        className="w-full rounded-xl"
                        disabled={isLoading || form.watch("otp").length !== 6}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
                        ) : (
                            <>
                                Verify
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </>
                        )}
                    </Button>

                    <div className="text-center mt-1">
                        {timeLeft > 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Resend code in <span className="text-foreground font-medium">{timeLeft}s</span>
                            </p>
                        ) : (
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={isLoading}
                                className="text-sm text-primary hover:underline hover:text-primary/80 font-medium transition-colors"
                            >
                                Resend code
                            </button>
                        )}
                    </div>
                </form>
            </Form>
        </AuthCard>
    )
}
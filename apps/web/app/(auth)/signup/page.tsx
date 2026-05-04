"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerZodSchema } from "@workspace/validators";
import { RegisterFormValues } from "@workspace/types"
import { AuthCard } from "@/components/module/auth/auth-card";
import Link from "next/link";
import { Form } from "@workspace/ui/components/form";
import { Button } from "@workspace/ui/components/button";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Label } from "@workspace/ui/components/label";
import { signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isTermsChecked, setIsTermsChecked] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
    const router = useRouter();

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerZodSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        },
    });

    async function onSubmit(data: RegisterFormValues) {
        try {
            setIsLoading(true);
            setError(null);

            const { error } = await signUp.email({
                name: data.name,
                email: data.email,
                password: data.password,
            });

            if (error) {
                setError(error.message || "Something went wrong. Please try again.");
                return;
            }

            router.push(`/dashboard`)

        } catch (error) {
            console.log(error);
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthCard
            title="Create an account"
            description="Start automating your workflows today"
            error={error != null ? error : ""}
            footer={
                <div className="w-full text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                        href="/signin"
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
                        name="name"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="signup-form-fullName">
                                    Full Name
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="signup-form-fullName"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Enter your full name"
                                    autoComplete="off"
                                    type="text"
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                    <Controller
                        name="email"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="signup-form-email">
                                    Email
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="signup-form-email"
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

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="signup-form-terms"
                            name={"terms"}
                            checked={isTermsChecked}
                            onCheckedChange={() => setIsTermsChecked(!isTermsChecked)}
                        />

                        <Label htmlFor="signup-form-terms" className="text-sm text-muted-foreground">
                            I agree to the Terms of Service and Privacy Policy.
                        </Label>

                    </div>

                    <Button
                        type="submit"
                        className="w-full rounded-xl mt-2 cursor-pointer"
                        disabled={isLoading || !isTermsChecked}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
                        ) : (
                            "Create Account"
                        )}
                    </Button>
                </form>
            </Form>
        </AuthCard>
    )
}
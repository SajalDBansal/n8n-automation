"use client"
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Loader2, Shield, Smartphone, Trash } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Form } from "@workspace/ui/components/form";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordZodSchema } from "@workspace/validators";
import { ArchiveUserFormValues, ChangePasswordFormValues } from "@workspace/types";
import { useRouter } from "next/navigation";
import { Field, FieldDescription, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@workspace/ui/components/dialog";
import { useSession, updateUser, changePassword } from "@/lib/auth-client";
import { archiveUserZodSchema } from "@workspace/validators";
import { toast } from "sonner";

export default function UpdateProfileCard() {
    const router = useRouter();
    const { data: session, refetch } = useSession();
    const user = session?.user;

    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const [archiveError, setArchiveError] = useState<string | null>(null);
    const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);

    const profileForm = useForm({
        values: {
            name: user?.name ?? "",
            image: user?.image ?? "",
        },
    });

    async function onProfileSubmit(data: { name: string; image: string }) {
        try {
            setIsSavingProfile(true);
            const { error } = await updateUser({ name: data.name, image: data.image || undefined });
            if (error) {
                toast.error(error.message || "Failed to update profile");
                return;
            }
            await refetch();
            toast.success("Profile updated successfully");
        } finally {
            setIsSavingProfile(false);
        }
    }

    const passwordForm = useForm<ChangePasswordFormValues>({
        resolver: zodResolver(changePasswordZodSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    async function onChangePassword(data: ChangePasswordFormValues) {
        const { error } = await changePassword({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
            revokeOtherSessions: true,
        });

        if (error) {
            toast.error(error.message || "Failed to change password");
            return;
        }

        passwordForm.reset();
        toast.success("Password changed successfully");
    }

    const archiveForm = useForm<ArchiveUserFormValues>({
        resolver: zodResolver(archiveUserZodSchema),
        defaultValues: { password: "" },
    });

    async function onArchiveAccount(data: ArchiveUserFormValues) {
        try {
            setIsArchiving(true);
            setArchiveError(null);

            const response = await fetch("/api/auth/archive", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                setArchiveError(result.message || "Failed to archive account");
                return;
            }

            router.push("/signin");
        } catch (error) {
            console.error(error);
            setArchiveError("Something went wrong. Please try again.");
        } finally {
            setIsArchiving(false);
        }
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

    const fallbackAvatar = (user?.name ?? "").slice(0, 2).toUpperCase();

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-3"
        >
            <Card className="bg-background/50 backdrop-blur-xl border-border/50">
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Update your personal information.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col justify-between h-full">
                    <Form {...profileForm}>
                        <form className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 rounded-lg">
                                    <AvatarImage src={profileForm.watch("image")} alt={user?.name} />
                                    <AvatarFallback className="rounded-lg text-lg">{fallbackAvatar}</AvatarFallback>
                                </Avatar>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Controller
                                    name="name"
                                    control={profileForm.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid} className="gap-1">
                                            <FieldLabel htmlFor="profile-form-name">
                                                Full Name
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id="profile-form-name"
                                                aria-invalid={fieldState.invalid}
                                                placeholder="Your name"
                                                autoComplete="off"
                                                type="text"
                                            />
                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />

                                <Field className="gap-1">
                                    <FieldLabel htmlFor="profile-form-email">
                                        Email
                                    </FieldLabel>
                                    <Input
                                        id="profile-form-email"
                                        value={user?.email ?? ""}
                                        disabled
                                        readOnly
                                        type="email"
                                    />
                                    <FieldDescription>
                                        Contact support to change your email address.
                                    </FieldDescription>
                                </Field>
                            </div>

                            <Controller
                                name="image"
                                control={profileForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="gap-1">
                                        <FieldLabel htmlFor="profile-form-image">
                                            Avatar URL
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="profile-form-image"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="https://example.com/avatar.png"
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
                    <Button
                        onClick={profileForm.handleSubmit(onProfileSubmit)}
                        type="submit"
                        className="rounded-xl" disabled={isSavingProfile}>
                        {isSavingProfile ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
                        ) : (
                            "Save Profile"
                        )}
                    </Button>
                </CardFooter>
            </Card>

            <Card className="bg-background/50 backdrop-blur-xl border-border/50">
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Manage your password and security modes.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="grid gap-3 p-4 border border-border/50 rounded-xl bg-background/30">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Shield className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-medium">Password</h4>
                                    <p className="text-sm text-muted-foreground">Update your account password.</p>
                                </div>
                            </div>

                            <Controller
                                name="currentPassword"
                                control={passwordForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="gap-1">
                                        <FieldLabel htmlFor="change-password-current">Current Password</FieldLabel>
                                        <Input {...field} id="change-password-current" type="password" autoComplete="current-password" aria-invalid={fieldState.invalid} />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Controller
                                    name="newPassword"
                                    control={passwordForm.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid} className="gap-1">
                                            <FieldLabel htmlFor="change-password-new">New Password</FieldLabel>
                                            <Input {...field} id="change-password-new" type="password" autoComplete="new-password" aria-invalid={fieldState.invalid} />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />
                                <Controller
                                    name="confirmPassword"
                                    control={passwordForm.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid} className="gap-1">
                                            <FieldLabel htmlFor="change-password-confirm">Confirm New Password</FieldLabel>
                                            <Input {...field} id="change-password-confirm" type="password" autoComplete="new-password" aria-invalid={fieldState.invalid} />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />
                            </div>

                            <Button
                                type="submit"
                                variant="outline"
                                size="sm"
                                className="rounded-lg w-fit justify-self-end"
                                disabled={passwordForm.formState.isSubmitting}
                            >
                                {passwordForm.formState.isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Change Password"
                                )}
                            </Button>
                        </form>
                    </Form>

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
                        <Button variant="outline" size="sm" className="rounded-lg" disabled>Coming soon</Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-background/50 backdrop-blur-xl border-border/50 h-full">
                <CardHeader>
                    <CardTitle>Danger Zone</CardTitle>
                    <CardDescription>Archive your account. This can be reversed by contacting support.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/5 border border-destructive/30">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-destructive/10 rounded-lg">
                                <Trash className="h-5 w-5 text-destructive" />
                            </div>
                            <div>
                                <h4 className="font-bold text-destructive">Archive Account</h4>
                                <p className="text-sm text-destructive">
                                    Archive your account and sign out of every device. Your data is kept but the account becomes inaccessible.
                                </p>
                            </div>
                        </div>

                        <Dialog open={isArchiveDialogOpen} onOpenChange={(open) => {
                            setIsArchiveDialogOpen(open);
                            if (!open) {
                                archiveForm.reset();
                                setArchiveError(null);
                            }
                        }}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="rounded-lg cursor-pointer"
                                >
                                    Archive
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Confirm account archival</DialogTitle>
                                    <DialogDescription>
                                        Enter your password to confirm. You'll be signed out of every device immediately.
                                    </DialogDescription>
                                </DialogHeader>
                                <Form {...archiveForm}>
                                    <form onSubmit={archiveForm.handleSubmit(onArchiveAccount)} className="space-y-4">
                                        <Controller
                                            name="password"
                                            control={archiveForm.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel htmlFor="archive-form-password">Password</FieldLabel>
                                                    <Input {...field} id="archive-form-password" type="password" autoComplete="current-password" aria-invalid={fieldState.invalid} />
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                    {archiveError && <FieldDescription className="text-destructive">{archiveError}</FieldDescription>}
                                                </Field>
                                            )}
                                        />
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button type="button" variant="outline" className="rounded-lg">Cancel</Button>
                                            </DialogClose>
                                            <Button type="submit" variant="destructive" className="rounded-lg" disabled={isArchiving}>
                                                {isArchiving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Archive Account"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>

        </motion.div>
    )
}

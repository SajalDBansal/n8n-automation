"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Monitor, Moon, Sun, UserRound } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";

const THEME_OPTIONS = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
] as const;

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const { data: session } = useSession();
    const [mounted, setMounted] = useState(false);

    // Theme is only known client-side after hydration — avoids rendering
    // the wrong option selected for a split second.
    useEffect(() => setMounted(true), []);

    return (
        <div className="flex flex-1 flex-col gap-4 w-full max-w-3xl mx-auto h-full overflow-hidden p-2">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage how the app looks and behaves.</p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid gap-3"
            >
                <Card className="bg-background/50 backdrop-blur-xl border-border/50">
                    <CardHeader>
                        <CardTitle>Appearance</CardTitle>
                        <CardDescription>Choose how the interface looks. Applies immediately, everywhere.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-3">
                            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
                                const isActive = mounted && theme === value;
                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setTheme(value)}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors cursor-pointer ${isActive
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border/50 bg-background/30 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                                            }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span className="text-sm font-medium">{label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-background/50 backdrop-blur-xl border-border/50">
                    <CardHeader>
                        <CardTitle>Account</CardTitle>
                        <CardDescription>Profile, password, and account deletion live on your Profile page.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link
                            href="/profile"
                            className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-background/30 hover:border-primary/40 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <UserRound className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{session?.user?.name ?? "Your account"}</p>
                                    <p className="text-xs text-muted-foreground">{session?.user?.email ?? "Go to Profile"}</p>
                                </div>
                            </div>
                            <span className="text-sm text-primary font-medium">Open Profile →</span>
                        </Link>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}

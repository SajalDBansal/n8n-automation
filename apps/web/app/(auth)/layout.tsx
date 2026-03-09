"use client";

import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { Spotlight } from "@workspace/ui/components/spotlight";
import { ThemeToggle } from "@/components/theme-toggler";
import { useSession } from "next-auth/react";
import Loading from "../loading";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    if (status === "loading") {
        return <Loading />;
    }

    if (status === "authenticated") {
        router.push("/dashboard");
        return null;
    }

    return (
        <div className="flex min-h-screen w-full bg-background selection:bg-primary selection:text-primary-foreground relative overflow-hidden">
            {/* Abstract Animated Nodes (Top Left) */}
            <div className="absolute left-[10%] top-[20%] w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none opacity-50" />
            <div className="absolute right-[10%] bottom-[20%] w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none opacity-50" />

            {/* Left Visual Panel - hidden on mobile */}
            <div className="hidden lg:flex w-1/2 flex-col justify-between p-10 relative overflow-hidden border-r border-border/50 bg-black/5 dark:bg-black/20">
                <Spotlight
                    className="-top-40 left-0 md:left-60 md:-top-20"
                    fill="currentColor"
                />
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[50px_50px] pointer-events-none" />

                <div className="z-10 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <span className="font-bold text-sm">A</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight">AutomateAI</span>
                </div>

                <div className="z-10 flex flex-col max-w-sm relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h1 className="text-4xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-linear-to-r from-foreground to-foreground/70">
                            Automate workflows.
                            <br />
                            Simplify everything.
                        </h1>
                        <p className="text-muted-foreground">
                            Join thousands of developers building fast, reliable, and scalable
                            automations.
                        </p>
                    </motion.div>

                    {/* Floating subtle workflow nodes mockup */}
                    <motion.div
                        className="mt-12 relative w-full h-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                    >
                        <div className="absolute left-[10%] top-[10%] text-xs bg-card border border-border p-2 rounded-lg shadow-lg flex items-center gap-2">
                            <div className="w-5 h-5 bg-blue-500/20 text-blue-500 rounded flex items-center justify-center"><Sparkles className="w-3 h-3" /></div>
                            Trigger
                        </div>
                        <svg className="absolute left-[33%] top-[20%] w-16 h-2 text-primary" preserveAspectRatio="none" viewBox="0 0 100 10">
                            <path d="M0,5 L100,5" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
                        </svg>
                        <div className="absolute left-[50%] top-[12%] text-xs bg-primary border border-primary/50 text-primary-foreground p-2 rounded-lg shadow-lg shadow-primary/20 flex items-center gap-2">
                            <div className="w-5 h-5 bg-background/20 rounded flex items-center justify-center"><Sparkles className="w-3 h-3" /></div>
                            Action
                        </div>
                    </motion.div>
                </div>

                <div className="z-10 text-sm text-muted-foreground">
                    © {new Date().getFullYear()} AutomateAI Inc.
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex-1 flex flex-col px-4 sm:px-6 lg:px-8 relative z-10">
                <header className="flex h-16 shrink-0 items-center justify-between lg:justify-end gap-x-4">
                    <Link href="/" className="lg:hidden flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <span className="font-bold text-sm">A</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">AutomateAI</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Back to home</span>
                        </Link>
                        <ThemeToggle />
                    </div>
                </header>

                <main className="flex-1 flex items-center justify-center py-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="w-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}

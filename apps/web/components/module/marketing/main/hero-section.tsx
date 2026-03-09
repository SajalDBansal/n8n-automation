"use client";
import { Spotlight } from "@workspace/ui/components/spotlight";
import { Badge } from "@workspace/ui/components/badge";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

export default function HeroSection() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    return (
        <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-background">
            <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="currentColor" />

            {/* Background gradients */}
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[50px_50px] pointer-events-none" />
            <div className="absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50" />

            <div className="z-10 container mx-auto px-4 md:px-6 flex flex-col items-center text-center pt-20 pb-32">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center max-w-4xl"
                >
                    <motion.div variants={itemVariants} className="mb-6">
                        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary px-4 py-1.5 rounded-full backdrop-blur-sm">
                            <Sparkles className="w-3.5 h-3.5 mr-2 inline-block" />
                            n8n-Automate version 1.0 is now live
                        </Badge>
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
                        Automate Everything.
                        <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-500">
                            {" "}Without Limits.
                        </span>
                    </motion.h1>

                    <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12">
                        The visual workspace for developers and teams. Connect your APIs, databases,
                        and tools seamlessly to build robust workflows without writing boilerplate code.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Button size="lg" className="rounded-full shadow-lg shadow-primary/20 h-12 px-8 text-base font-medium">
                            <Link href="/signin" className="flex items-center">
                                Get Started
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </Button>

                        <Button size="lg" variant="outline" className="rounded-full h-12 px-8 text-base font-medium border-border/50 bg-background/50 backdrop-blur-sm">
                            <Link href="#demo" className="">
                                View Demo
                            </Link>
                        </Button>

                    </motion.div>
                </motion.div>

                {/* Hero Visual Mock */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                    className="mt-20 w-full z-50 max-w-5xl rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden hidden md:block"
                >
                    <div className="flex items-center px-4 py-3 border-b border-border/50 bg-muted/20">
                        <div className="flex space-x-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                            <div className="w-3 h-3 rounded-full bg-green-500/80" />
                        </div>
                        <div className="mx-auto text-xs font-medium text-muted-foreground flex items-center gap-2">
                            <span className="w-4 h-4 bg-primary/20 rounded inline-flex items-center justify-center text-[10px] text-primary font-bold">A</span>
                            n8n-Automate Editor
                        </div>
                    </div>
                    <div className="aspect-video w-full bg-grid-white/[0.02] relative">
                        <div className="absolute inset-0 flex items-center justify-center opacity-70">
                            {/* Abstract Node Visual */}
                            <div className="relative w-full h-full flex items-center justify-center">
                                <div className="absolute left-[21%] top-[41%] text-sm bg-card border border-border p-3 rounded-xl shadow-lg flex items-center gap-2">
                                    <div className="w-6 h-6 roundedbg-muted flex items-center justify-center bg-blue-500/20 text-blue-500 rounded"><Sparkles className="w-4 h-4" /></div>
                                    Webhook
                                </div>
                                <svg className="absolute left-[33%] top-[45%] w-32 h-2 text-primary" preserveAspectRatio="none" viewBox="0 0 100 10">
                                    <path d="M0,5 L100,5" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
                                </svg>
                                <div className="absolute left-[45%] top-[41%] text-sm bg-primary border border-primary/50 text-primary-foreground p-3 rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2">
                                    <div className="w-6 h-6 bg-background/20 rounded flex items-center justify-center"><Sparkles className="w-4 h-4" /></div>
                                    Data Transform
                                </div>
                                <svg className="absolute left-[61%] top-[33%] w-[10%] h-[12%] text-primary" preserveAspectRatio="none" viewBox="0 0 100 100">
                                    <path d="M0,100 C50,100 50,0 100,0" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
                                </svg>
                                <div className="absolute left-[71%] top-[29%] text-sm bg-card border border-border p-3 rounded-xl shadow-lg flex items-center gap-2">
                                    <div className="w-6 h-6 bg-green-500/20 text-green-500 rounded flex items-center justify-center"><Sparkles className="w-4 h-4" /></div>
                                    PostgreSQL
                                </div>

                                <svg className="absolute left-[61%] top-[45%] w-[10%] h-[12%] text-primary" preserveAspectRatio="none" viewBox="0 0 100 100">
                                    <path d="M0,0 C50,0 50,100 100,100" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
                                </svg>
                                <div className="absolute left-[71%] top-[52%] text-sm bg-card border border-border p-3 rounded-xl shadow-lg flex items-center gap-2">
                                    <div className="w-6 h-6 bg-green-500/20 text-green-500 rounded flex items-center justify-center"><Sparkles className="w-4 h-4" /></div>
                                    PostgreSQL
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
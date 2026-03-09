"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

export default function CTASection() {
    return (
        <section className="relative w-full py-32 overflow-hidden">
            {/* Deep dark gradient background with a glow */}
            <div className="absolute inset-0 bg-background" />
            <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-purple-700/10 to-background" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-125 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="container relative z-10 mx-auto px-4 md:px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="max-w-4xl mx-auto border border-border/50 bg-card/20 backdrop-blur-xl rounded-3xl p-10 md:p-20 shadow-2xl"
                >
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                        Ready to <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-400">automate your future</span>?
                    </h2>
                    <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                        Join thousands of developers turning complex processes into simple, scalable workflows.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button size="lg" className="rounded-full shadow-[0_0_20px_rgba(var(--primary),0.4)] h-14 px-10 text-lg font-medium">
                            <Link href="/signin" className="flex items-center">
                                Start Automating Today <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </Button>
                        <p className="text-sm text-muted-foreground mt-4 sm:mt-0 sm:ml-4">No credit card required.</p>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
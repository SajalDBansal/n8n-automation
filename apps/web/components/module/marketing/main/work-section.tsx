"use client";

import { motion } from "framer-motion";
import { Link2, Sparkles, Workflow } from "lucide-react"; export default function WorkSection() {

    const steps = [
        {
            title: "Connect Your Apps",
            description: "Securely authenticate and connect all your favorite tools, databases, and APIs in seconds. We handle the OAuth flows.",
            icon: Link2,
        },
        {
            title: "Build the Workflow",
            description: "Drag and drop nodes onto the infinite canvas. Use our AI assistant to generate complex data transformations instantly.",
            icon: Workflow,
        },
        {
            title: "Automate & Monitor",
            description: "Hit activate and watch your data flow. Our robust engine ensures your tasks run perfectly every time with detailed logging.",
            icon: Sparkles,
        },
    ];

    return (
        <section id="how-it-works" className="w-full py-24 md:py-32 bg-background relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
                    >
                        How it works
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground text-lg"
                    >
                        Three simple steps to automate your work and save hundreds of hours.
                    </motion.p>
                </div>

                <div className="max-w-5xl mx-auto relative">
                    {/* Vertical line connecting steps */}
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border/50 -translate-x-1/2 z-0" />

                    <div className="space-y-12 md:space-y-24">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isEven = index % 2 === 0;

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.5 }}
                                    className={`flex flex-col md:flex-row items-center gap-8 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                                >
                                    <div className="flex-1 text-center md:text-left">
                                        <div className={`md:max-w-md ${!isEven && 'ml-auto text-center md:text-right'}`}>
                                            <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                                            <p className="text-muted-foreground text-lg leading-relaxed">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative z-10 w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-[0_0_30px_rgba(var(--primary),0.3)] shrink-0">
                                        <Icon className="w-8 h-8" />
                                    </div>

                                    <div className="flex-1 hidden md:block" />
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}
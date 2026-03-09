"use client";
import { Workflow, Blocks, Server, Zap, Code2, Puzzle } from "lucide-react";
import { motion } from "framer-motion";
import { BackgroundBeams } from "@workspace/ui/components/background-beams";


export default function FeaturesSection() {

    const features = [
        {
            title: "Visual Workflow Builder",
            description: "Drag and drop nodes to build complex logic without writing a single line of boilerplate code.",
            icon: Workflow,
        },
        {
            title: "100+ Integrations",
            description: "Seamlessly connect to your favorite tools, databases, and APIs natively.",
            icon: Blocks,
        },
        {
            title: "Self-Hosting",
            description: "Deploy on your own infrastructure and maintain complete control over your data.",
            icon: Server,
        },
        {
            title: "Real-time Execution",
            description: "Experience ultra-low latency execution optimized for mission-critical workflows.",
            icon: Zap,
        },
        {
            title: "API-First Approach",
            description: "Trigger workflows via webhooks or our comprehensive RESTful API endpoints.",
            icon: Code2,
        },
        {
            title: "Custom Nodes",
            description: "Build logic exactly the way you need it using the Javascript function node.",
            icon: Puzzle,
        },
    ];

    return (
        <section id="features" className="relative w-full py-24 md:py-32 bg-background overflow-hidden">
            <BackgroundBeams className="opacity-40" />

            <div className="container relative z-10 mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
                    >
                        Powerful features for <span className="text-primary">power users</span>.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground text-lg"
                    >
                        Everything you need to automate your entire business stack, carefully crafted for developers and technical teams.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="relative group p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm hover:border-primary/50 transition-colors"
                            >
                                <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed flex-1">
                                        {feature.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    )
}
"use client";
import { motion } from "framer-motion";
import { Building2, Globe, Cloud, Database, Cpu, Network } from "lucide-react";

export default function TrustedBySection() {

    const companies = [
        { name: "Acme Corp", icon: Building2 },
        { name: "GlobalTech", icon: Globe },
        { name: "CloudSync", icon: Cloud },
        { name: "DataFlow", icon: Database },
        { name: "NeuralNet", icon: Cpu },
        { name: "DevOps Inc", icon: Network },
    ];

    return (
        <section className="w-full py-16 border-y border-border/40 bg-muted/10 overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">
                <p className="text-center text-sm font-medium text-muted-foreground mb-8">
                    TRUSTED BY INNOVATIVE TEAMS WORLDWIDE
                </p>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    {companies.map((company, index) => {
                        const Icon = company.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ scale: 1.1, color: "var(--color-primary)" }}
                                className="flex items-center gap-2 cursor-default shrink-0"
                            >
                                <Icon className="w-8 h-8" />
                                <span className="font-bold text-xl tracking-tight hidden sm:block">
                                    {company.name}
                                </span>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    )
}
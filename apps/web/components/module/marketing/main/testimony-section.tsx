"use client";

import { motion } from "framer-motion";

export default function TestimonySection() {

    const testimonials = [
        {
            quote: "n8n-Automate completely transformed how we handle customer onboarding. We replaced 4 different tools with a single visual workflow. Incredible.",
            author: "Sarah Jenks",
            role: "VP of Engineering, CloudSync",
            avatar: "SJ"
        },
        {
            quote: "As a developer, I usually hate visual builders. But this one gives me the exact API control I need while letting PMs understand the logic.",
            author: "David Lee",
            role: "Lead Architect, Nexus",
            avatar: "DL"
        },
        {
            quote: "The self-hosting capability combined with the blazing fast execution speeds makes this a no-brainer for our enterprise infrastructure.",
            author: "Michael Ross",
            role: "CTO, Finova",
            avatar: "MR"
        }
    ];


    return (
        <section className="w-full py-24 bg-background">
            <div className="container mx-auto px-4 md:px-6">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center mb-16">
                    Loved by technical teams.
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((test, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="p-8 rounded-3xl border border-border/50 bg-muted/20 hover:bg-muted/30 transition-colors"
                        >
                            <div className="flex items-center gap-1 mb-6 text-primary">
                                {[...Array(5)].map((_, j) => (
                                    <svg key={j} className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                                ))}
                            </div>
                            <p className="text-lg mb-8 italic text-muted-foreground leading-relaxed h-32">"{test.quote}"</p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shadow-inner">
                                    {test.avatar}
                                </div>
                                <div>
                                    <h4 className="font-bold">{test.author}</h4>
                                    <p className="text-sm text-muted-foreground">{test.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
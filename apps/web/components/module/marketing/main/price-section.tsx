"use client";

import { Badge } from "@workspace/ui/components/badge";
import { motion } from "framer-motion";

export default function PriceSection() {

    const plans = [
        {
            name: "Starter",
            desc: "For individuals and small teams.",
            price: "Free",
            features: ["Up to 5 active workflows", "1000 executions / month", "Community support"],
            popular: false,
        },
        {
            name: "Pro",
            desc: "For growing businesses.",
            price: "$29",
            period: "/month",
            features: ["Unlimited workflows", "50,000 executions / month", "Premium integrations", "Priority support"],
            popular: true,
        },
        {
            name: "Enterprise",
            desc: "For large scale operations.",
            price: "Custom",
            features: ["Unlimited everything", "Self-hosting options", "SLA & SSO", "Dedicated account manager"],
            popular: false,
        },
    ];


    return (
        <section id="pricing" className="w-full py-24 bg-muted/10 border-t border-border/40">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                        Simple, transparent pricing.
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Start for free, upgrade when you need more power and executions.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative flex flex-col p-8 rounded-3xl border ${plan.popular ? "border-primary shadow-2xl shadow-primary/20 bg-background" : "border-border/50 bg-card/40 backdrop-blur-sm"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <Badge className="bg-primary text-primary-foreground hover:bg-primary px-3 py-1 rounded-full uppercase tracking-wider text-xs font-bold">
                                        Most Popular
                                    </Badge>
                                </div>
                            )}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                <p className="text-muted-foreground text-sm h-10">{plan.desc}</p>
                            </div>
                            <div className="mb-8 flex items-baseline gap-1">
                                <span className="text-4xl font-extrabold">{plan.price}</span>
                                {plan.period && <span className="text-muted-foreground font-medium">{plan.period}</span>}
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((k, j) => (
                                    <li key={j} className="flex items-center gap-3 text-sm">
                                        <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        <span>{k}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                className={`w-full py-3 rounded-xl font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98] ${plan.popular ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted text-foreground hover:bg-muted/80"
                                    }`}
                            >
                                Get Started
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
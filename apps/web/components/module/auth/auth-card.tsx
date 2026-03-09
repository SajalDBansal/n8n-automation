"use client";

import { cn } from "@workspace/ui/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";

interface AuthCardProps {
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    className?: string;
}

export function AuthCard({
    title,
    description,
    children,
    footer,
    className,
}: AuthCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn("w-full max-w-md mx-auto", className)}
        >
            <Card className="border-border/50 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden rounded-2xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        {title}
                    </CardTitle>
                    {description && (
                        <CardDescription className="text-muted-foreground">
                            {description}
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent>{children}</CardContent>
                {footer && <CardFooter>{footer}</CardFooter>}
            </Card>
        </motion.div>
    );
}

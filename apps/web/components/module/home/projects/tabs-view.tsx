"use client";
import { Activity, Key, LucideIcon, Settings, Waypoints } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type ActiveTabType = "credentials" | "executions" | "workflows";

type TabsType = {
    id: ActiveTabType,
    lable: string,
    icon: LucideIcon
}

export default function TabsView({ projectId }: { projectId: string }) {
    const pathName = usePathname();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<ActiveTabType>("workflows");

    useEffect(() => {
        if (pathName.includes("credentials")) {
            setActiveTab("credentials");
        } else if (pathName.includes("executions")) {
            setActiveTab("executions");
        } else {
            setActiveTab("workflows");
        }

    }, [pathName]);

    const tabs: TabsType[] = [
        { id: "workflows", lable: "Workflows", icon: Waypoints },
        { id: "credentials", lable: "Credentials", icon: Key },
        { id: "executions", lable: "Executions", icon: Activity },
    ];

    const handleTabClick = (tabId: ActiveTabType) => {
        setActiveTab(tabId);
        router.push(`/projects/${projectId}/${tabId !== "workflows" ? tabId : ""}`);
    }

    return (
        <div className="flex items-center gap-2 border-b border-border/50 pb-px">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`relative px-4 py-2 text-sm font-medium transition-colors hover:text-foreground flex items-center gap-2 ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.lable}
                        {isActive && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                initial={false}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                    </button>
                );
            })}
        </div>
    )
}
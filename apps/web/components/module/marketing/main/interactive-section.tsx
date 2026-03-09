"use client";

import { Database, Sparkles, Webhook } from "lucide-react";
import { ReactFlow, Background, Controls, Node, Edge, Handle, Position } from "@xyflow/react";
import { motion } from "framer-motion";

const CustomNode = ({ data }: any) => {
    return (
        <div className="px-4 py-2 shadow-xl shadow-primary/10 rounded-xl bg-card border border-border/60 min-w-37.5">
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-primary" />
            <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                    {data.icon}
                    <div className="text-sm font-bold">{data.label}</div>
                </div>
                <div className="text-[10px] text-muted-foreground">{data.description}</div>
            </div>
            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-primary" />
        </div>
    );
};

const nodeTypes = { custom: CustomNode };

const initialNodes: Node[] = [
    {
        id: '1',
        type: 'custom',
        data: { label: 'Webhook', description: 'Triggers on POST request', icon: <Webhook className="w-4 h-4 text-orange-500" /> },
        position: { x: 50, y: 150 },
    },
    {
        id: '2',
        type: 'custom',
        data: { label: 'Data Transform', description: 'Map JSON fields', icon: <Sparkles className="w-4 h-4 text-primary" /> },
        position: { x: 350, y: 150 },
    },
    {
        id: '3',
        type: 'custom',
        data: { label: 'PostgreSQL', description: 'Insert new row', icon: <Database className="w-4 h-4 text-green-500" /> },
        position: { x: 650, y: 50 },
    },
    {
        id: '4',
        type: 'custom',
        data: { label: 'Slack', description: 'Send notification', icon: <Webhook className="w-4 h-4 text-blue-500" /> },
        position: { x: 650, y: 250 },
    },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: 'hsl(var(--primary))' } },
    { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: 'hsl(var(--primary))' } },
    { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: 'hsl(var(--primary))' } },
];

export default function InteractiveDemoSection() {
    const defaultViewport = { x: 0, y: 0, zoom: 0.8 };

    return (
        <section id="demo" className="w-full py-24 bg-muted/20 border-y border-border/40">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    <div className="flex-1 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                                Build workflows visually.
                            </h2>
                            <p className="text-muted-foreground text-lg max-w-lg mb-8">
                                Connect your tools in minutes using our intuitive drag-and-drop editor. Monitor your data flowing in real-time through nodes.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "No coding required for simple setups.",
                                    "Write JavaScript when you need advanced logic.",
                                    "Version control baked directly into workflows."
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs shrink-0">
                                            {i + 1}
                                        </div>
                                        <span className="font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="flex-[1.5] w-full min-h-125 h-125 border border-border/60 rounded-3xl overflow-hidden shadow-2xl bg-background"
                    >
                        {/* Provide a distinct height wrapper for ReactFlow */}
                        <ReactFlow
                            nodes={initialNodes}
                            edges={initialEdges}
                            nodeTypes={nodeTypes}
                            defaultViewport={defaultViewport}
                            fitView
                            attributionPosition="bottom-right"
                            className="dark:bg-background"
                        >

                            <Background color="hsl(var(--border))" gap={16} />
                            <Controls className="text-black" />
                        </ReactFlow>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
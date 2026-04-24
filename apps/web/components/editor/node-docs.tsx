import { BookOpen, ExternalLink, Mail, Send, Bot, Sparkles, MousePointerClick } from "lucide-react";

export function WebhookDocs() {
    return (
        <div className="h-full overflow-y-auto mt-4">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                            <BookOpen className="w-5 h-5 text-foreground/80" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold tracking-tight">
                                Webhook Node Documentation
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Learn how to configure and use webhook triggers
                            </p>
                        </div>
                    </div>

                    <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                </div>

                {/* Intro */}
                <div className="text-sm text-muted-foreground leading-relaxed">
                    The Webhook node allows you to receive HTTP requests and trigger workflows
                    based on external events.
                </div>

                {/* Features */}
                <div className="rounded-xl border bg-background p-4 shadow-sm">
                    <h4 className="text-sm font-semibold mb-3 text-foreground">
                        Key Features
                    </h4>

                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                            Listen for HTTP requests (GET, POST, PUT, DELETE, etc.)
                        </li>
                        <li className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                            Handle different content types (JSON, form data, etc.)
                        </li>
                        <li className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                            Configure custom response behavior
                        </li>
                        <li className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                            Extract data from headers, query parameters, and body
                        </li>
                    </ul>
                </div>

                {/* Configuration */}
                <div className="rounded-xl border bg-background p-4 shadow-sm">
                    <h4 className="text-sm font-semibold mb-3 text-foreground">
                        Configuration
                    </h4>

                    <ul className="space-y-3 text-sm">
                        <li>
                            <span className="font-medium text-foreground">HTTP Method:</span>
                            <span className="text-muted-foreground"> Choose which HTTP methods to accept</span>
                        </li>
                        <li>
                            <span className="font-medium text-foreground">Path:</span>
                            <span className="text-muted-foreground"> Set a custom path for the webhook URL</span>
                        </li>
                        <li>
                            <span className="font-medium text-foreground">Authentication:</span>
                            <span className="text-muted-foreground"> Configure security if needed</span>
                        </li>
                    </ul>
                </div>

            </div>
        </div>
    )
}


export function ManualTriggerDocs() {
    return (
        <div className="h-full overflow-y-auto mt-4">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <MousePointerClick className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold tracking-tight">
                                Manual Trigger
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Trigger your workflow manually from the editor
                            </p>
                        </div>
                    </div>
                </div>

                <div className="text-sm text-muted-foreground leading-relaxed">
                    The Manual Trigger node allows you to run your workflow on demand by simply clicking the "Test Workflow" button. It's perfect for testing and workflows that do not require an automated start.
                </div>

                <div className="rounded-xl border bg-background p-4 shadow-sm">
                    <h4 className="text-sm font-semibold mb-3 text-foreground">
                        Key Features
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                            Instantly start workflows during development
                        </li>
                        <li className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                            Run administrative or utility workflows on-demand
                        </li>
                        <li className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                            Provide mock input data to test downstream nodes
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export function ResendDocs() {
    return (
        <div className="h-full overflow-y-auto mt-4">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                            <Mail className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold tracking-tight">
                                Resend Node
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Send emails programmatically using the Resend API
                            </p>
                        </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                </div>

                <div className="text-sm text-muted-foreground leading-relaxed">
                    The Resend node integrates with your Resend account to send transactional emails easily and reliably.
                </div>

                <div className="rounded-xl border bg-background p-4 shadow-sm">
                    <h4 className="text-sm font-semibold mb-3 text-foreground">
                        Configuration
                    </h4>
                    <ul className="space-y-3 text-sm">
                        <li>
                            <span className="font-medium text-foreground">Credentials:</span>
                            <span className="text-muted-foreground"> Connect your Resend API Key</span>
                        </li>
                        <li>
                            <span className="font-medium text-foreground">From / To:</span>
                            <span className="text-muted-foreground"> Define the sender and recipient addresses</span>
                        </li>
                        <li>
                            <span className="font-medium text-foreground">Subject & Body:</span>
                            <span className="text-muted-foreground"> Compose the email content with plain text or HTML</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export function TelegramDocs() {
    return (
        <div className="h-full overflow-y-auto mt-4">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/30">
                            <Send className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold tracking-tight">
                                Telegram Node
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Interact with Telegram bots and send messages
                            </p>
                        </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                </div>

                <div className="text-sm text-muted-foreground leading-relaxed">
                    Automate interactions on Telegram by sending messages, photos, documents, and more to your groups and channels.
                </div>

                <div className="rounded-xl border bg-background p-4 shadow-sm">
                    <h4 className="text-sm font-semibold mb-3 text-foreground">
                        Key Features
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-500" />
                            Send text messages to users and channels
                        </li>
                        <li className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-500" />
                            Send media like photos, videos, and documents
                        </li>
                        <li className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-500" />
                            Manage chat and bot administrative operations
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export function GoogleGeminiChatDocs() {
    return (
        <div className="h-full overflow-y-auto mt-4">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold tracking-tight">
                                Google Gemini Chat
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Generate intelligent responses using Google's Gemini Models
                            </p>
                        </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                </div>

                <div className="text-sm text-muted-foreground leading-relaxed">
                    Harness the power of Google's Gemini language models to analyze text, answer questions, or generate natural language chat completions in your workflow.
                </div>

                <div className="rounded-xl border bg-background p-4 shadow-sm">
                    <h4 className="text-sm font-semibold mb-3 text-foreground">
                        Configuration
                    </h4>
                    <ul className="space-y-3 text-sm">
                        <li>
                            <span className="font-medium text-foreground">Credentials:</span>
                            <span className="text-muted-foreground"> Provide your Google Gemini API key</span>
                        </li>
                        <li>
                            <span className="font-medium text-foreground">Model ID:</span>
                            <span className="text-muted-foreground"> Select between models like gemini-pro or gemini-pro-vision</span>
                        </li>
                        <li>
                            <span className="font-medium text-foreground">Prompt:</span>
                            <span className="text-muted-foreground"> The text prompt or context sent to the model</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export function AgentDocs() {
    return (
        <div className="h-full overflow-y-auto mt-4">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                            <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold tracking-tight">
                                AI Agent Node
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Create autonomous AI agents to accomplish tasks
                            </p>
                        </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                </div>

                <div className="text-sm text-muted-foreground leading-relaxed">
                    The Agent node acts as a cognitive engine capable of taking a complex task, breaking it down, and utilizing available tools and data context to reach a goal.
                </div>

                <div className="rounded-xl border bg-background p-4 shadow-sm">
                    <h4 className="text-sm font-semibold mb-3 text-foreground">
                        Key Features
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                            Equip the agent with tools connected from other nodes
                        </li>
                        <li className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                            Memory capability to maintain context across steps
                        </li>
                        <li className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                            Autonomous decision making based on the provided prompt
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
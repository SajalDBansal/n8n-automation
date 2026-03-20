"use client";
import { getProjectCredentials } from "@/action/db/workflow";
import TabViewCard from "@/components/module/home/projects/tab-view-card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { MoreHorizontal, ShieldX } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type CredentialsType = {
    createdAt: string;
    updatedAt: string;
    id: string;
    name: string;
    type: string;
}

export default function ProjectCredentialsPage() {
    const [loading, setLoading] = useState(false);
    const [credentials, setCredentials] = useState<CredentialsType[]>([]);
    const { projectId }: { projectId: string } = useParams();

    useEffect(() => {
        const run = async () => {
            try {
                setLoading(true);
                const res = await getProjectCredentials(projectId);

                if (!res.success) throw new Error(res.message);
                console.log(res.credentials);

                setCredentials(res.credentials ?? []);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        run();
    }, [projectId]);

    const getCredentialDisplayName = (type: string) => {
        switch (type.toLowerCase()) {
            case 'telegramapi':
                return 'Telegram API'
            case 'gmailoauth2api':
                return 'Gmail OAuth2 API'
            default:
                return type
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

        if (diffInHours < 1) {
            return 'just now'
        } else if (diffInHours < 24) {
            return `${diffInHours} hours ago`
        } else {
            const diffInDays = Math.floor(diffInHours / 24)
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
        }
    }

    const formatCreatedDate = (dateString: string) => {
        return new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            timeZone: "UTC",
        }).format(new Date(dateString));
    };

    return (
        <TabViewCard >
            <Card className="bg-background/50 backdrop-blur-xl border-border/50">
                <CardHeader>
                    <CardTitle>Project Credentials</CardTitle>
                    <CardDescription>Manage keys and auth tokens scoped to this project.</CardDescription>
                    <CardAction>
                        <Button>
                            Add Credentials
                        </Button>
                    </CardAction>
                </CardHeader>
                <CardContent className="min-h-75 flex items-center justify-center text-muted-foreground border-t border-border/50 bg-muted/5 p-4">

                    {/* 🔄 Loading State */}
                    {loading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full pt-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-16 rounded-xl bg-muted animate-pulse"
                                />
                            ))}
                        </div>
                    )}


                    {/* 📭 Empty State */}
                    {!loading && credentials.length === 0 && (
                        <div className="h-40 flex items-center justify-center py-8 text-muted-foreground">
                            <ShieldX className="w-6 h-6" />
                            <span className="ml-2 text-red-600">No executions found for this project.</span>
                        </div>
                    )}

                    {!loading && credentials.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full pt-4">
                            {credentials.map((credential) => (
                                <div key={credential.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <h3 className="font-medium text-gray-900">{credential.name}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <span>{getCredentialDisplayName(credential.type)}</span>
                                                <span>|</span>
                                                <span>Last updated {formatDate(credential.updatedAt)}</span>
                                                <span>|</span>
                                                <span>Created {formatCreatedDate(credential.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                    )}

                </CardContent>
            </Card>

        </TabViewCard>
    )
}
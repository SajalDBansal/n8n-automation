import CredentialsCards from "@/components/module/home/credentials/credentials-cards";

export default function CredentialsPage() {

    return (
        <div className="flex flex-1 flex-col gap-4 w-full max-w-7xl mx-auto h-full overflow-hidden p-2">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Credentials</h1>
                <p className="text-muted-foreground">Manage your connection keys and OAuth tokens.</p>
            </div>

            <CredentialsCards />
        </div>
    )
}
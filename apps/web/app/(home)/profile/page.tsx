import UpdateProfileCard from "@/components/module/auth/update-user-profile-card";

export default function ProfilePage() {
    return (
        <div className="flex flex-1 flex-col gap-4 w-full max-w-3xl mx-auto h-full overflow-hidden p-2">
            <div className="flex flex-col md:gap-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Profile Settings</h1>
                <p className=" text-muted-foreground">Manage your account preferences and personal information.</p>
            </div>

            <UpdateProfileCard />
        </div>
    )
}
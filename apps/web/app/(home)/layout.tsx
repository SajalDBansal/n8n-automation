import AppFooter from "@/components/module/home/home-layout/footer";
import AppHeader from "@/components/module/home/home-layout/header";
import { AppSidebar } from "@/components/module/home/home-layout/sidebar";
import { authOptions } from "@/lib/auth"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar";
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/signin");

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <AppHeader />

                <main className="flex flex-1 flex-col gap-4 p-4">
                    {children}
                </main>

                <AppFooter />

            </SidebarInset>
        </SidebarProvider>
    )
}
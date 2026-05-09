import AppFooter from "@/components/module/home/home-layout/footer";
import AppHeader from "@/components/module/home/home-layout/header";
import { AppSidebar } from "@/components/module/home/home-layout/sidebar";
import { auth } from "@/lib/auth"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar";
import { headers } from "next/headers"
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({ headers: await headers() });
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
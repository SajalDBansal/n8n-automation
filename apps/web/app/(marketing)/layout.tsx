import Footer from "@/components/module/marketing/footer"
import Navbar from "@/components/module/marketing/navbar"


export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col bg-background selection:bg-primary/30">
            <Navbar />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    )
}
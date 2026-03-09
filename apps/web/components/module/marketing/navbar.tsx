import Link from "next/link";
import { Waypoints } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils";
import { ThemeToggle } from "@/components/theme-toggler";
import { Button } from "@workspace/ui/components/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Navbar() {
    const session = await getServerSession(authOptions);
    // TODO: Show user avatar and name if logged in, otherwise show sign in and get started buttons

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
            <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
                <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <Waypoints className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="font-bold tracking-tight text-xl">n8n-Automate</span>
                </Link>
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                        Features
                    </Link>
                    <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                        How It Works
                    </Link>
                    <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                        Pricing
                    </Link>
                    <Link href="https://github.com/SajalDBansal/n8n-automation" className="text-muted-foreground hover:text-foreground transition-colors">
                        Source
                    </Link>
                </nav>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <div className="hidden sm:block">
                        {session ? (
                            <>
                                <Button variant="ghost" className="mr-2 rounded-full">
                                    <Link href="/projects">
                                        View Projects
                                    </Link>
                                </Button>
                                <Button variant="default" className="rounded-full hover:scale-105 transition-transform">
                                    <Link href="/dashboard" className={cn("")}>
                                        Dashboard
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" className="mr-2 rounded-full">
                                    <Link href="/signin">
                                        Sign In
                                    </Link>
                                </Button>
                                <Button variant="default" className="rounded-full hover:scale-105 transition-transform">
                                    <Link href="/dashboard" className={cn("")}>
                                        Get Started
                                    </Link>
                                </Button>
                            </>
                        )}

                    </div>
                </div>
            </div >
        </header >
    )
}
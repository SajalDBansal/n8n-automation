import { Waypoints, MessageCircle, Code2, Briefcase, User } from "lucide-react";
import Link from "next/link";

export default function Footer() {
    const links = {
        Product: ["Features", "Integrations", "Pricing", "Changelog"],
        Developers: ["Documentation", "API Reference", "GitHub", "Community"],
        Company: ["About Us", "Careers", "Blog", "Contact"],
        Legal: ["Privacy Policy", "Terms of Service", "Security"]
    };

    return (
        <footer className="w-full bg-background border-t border-border/40 py-16">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
                    <div className="col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                <Waypoints className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="font-bold tracking-tight text-xl">n8n-Automate</span>
                        </Link>
                        <p className="text-muted-foreground text-sm max-w-xs mb-8">
                            The visual workflow automation platform for technical teams and developers. Build, automate, and scale effortlessly.
                        </p>
                        <div className="flex gap-4">
                            <Link href="https://x.com/SAJALDUTTBANSAL" className="p-2 rounded-full border border-border bg-card hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                                <MessageCircle className="w-4 h-4" />
                            </Link>
                            <Link href="https://github.com/SajalDBansal/n8n-automation" className="p-2 rounded-full border border-border bg-card hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                                <Code2 className="w-4 h-4" />
                            </Link>
                            <Link href="https://me.sajaldbansal.com" className="p-2 rounded-full border border-border bg-card hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                                <User className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {Object.entries(links).map(([title, items]) => (
                        <div key={title} className="col-span-1">
                            <h4 className="font-semibold mb-4">{title}</h4>
                            <ul className="space-y-3">
                                {items.map((item) => (
                                    <li key={item}>
                                        <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/40 text-sm text-muted-foreground gap-4">
                    <p>© 2026 n8n Automation Inc. All rights reserved.</p>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        All systems operational
                    </div>
                </div>
            </div>
        </footer>
    )
}
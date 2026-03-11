import { Input } from "@workspace/ui/components/input";
import { Search } from "lucide-react";

export default function SearchBar() {
    return (
        <div className="relative w-full max-w-sm ml-4 hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search workflows or projects..."
                className="w-full bg-background/50 pl-8 md:w-75 lg:w-87.5 shadow-none h-9 border-muted"
            />
        </div>
    )
}
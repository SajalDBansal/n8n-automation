import { cn } from "@workspace/ui/lib/utils";
import { LoaderIcon } from "lucide-react";


export function NodeExecutionIndicator({
    status,
    size = 'md',
    className
}: {
    status: 'idle' | 'executing' | 'success' | 'failed';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    if (status === 'executing') {
        return <LoaderIcon
            role="status"
            aria-label="Loading"
            className={cn("size-4 animate-spin flex items-center justify-center rounded-full", className)}
        />;
    }

    if (status === 'success') {
        return (
            <div className={cn(
                'flex items-center justify-center rounded-full',
                sizeClasses[size],
                className
            )}>
                <svg
                    className="w-1/2 h-1/2 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                    />
                </svg>
            </div>
        );
    }

    if (status === 'idle') {
        return (
            <div className={cn(
                'flex items-center justify-center rounded-full',
                sizeClasses[size],
                className
            )}>
                <svg
                    className="w-1/2 h-1/2 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <rect x="6" y="5" width="4" height="14" rx="1" />
                    <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className={cn(
                'flex items-center justify-center rounded-full bg-red-500',
                sizeClasses[size],
                className
            )}>
                <svg
                    className="w-1/2 h-1/2 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </div>
        );
    }

    return null;
}
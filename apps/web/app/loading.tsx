import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary animate-pulse">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">Loading...</h2>
          <p className="text-sm text-muted-foreground">
            Please wait while we prepare your space.
          </p>
        </div>
      </div>
    </div>
  );
}

'use client'
import { SessionProvider as AuthSessionProvider } from "next-auth/react";

function SessionProvider({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <AuthSessionProvider>
            {children}
        </AuthSessionProvider>
    );
}

export { SessionProvider };

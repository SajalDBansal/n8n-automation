"use client";

import { createAuthClient } from "better-auth/react";
import publicConfig from "@/utils/public-config";

export const authClient = createAuthClient({
    baseURL: publicConfig.NEXT_PUBLIC_APP_URL,
});

export const { useSession, signIn, signUp, signOut, changePassword, updateUser } = authClient;

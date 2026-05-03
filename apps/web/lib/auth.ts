import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import prisma from "@workspace/database";
import config from "@/utils/config";

export const auth = betterAuth({
    baseURL: config.BETTER_AUTH_URL,
    secret: config.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, { provider: "postgresql" }),

    user: {
        additionalFields: {
            isArchived: {
                type: "boolean",
                defaultValue: false,
                input: false,
            },
        },
    },

    // No sendResetPassword callback — Better Auth treats that as "reset
    // password is disabled" and returns a clean 400 from /forget-password
    // instead of silently trying (and failing) to send an email.
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        minPasswordLength: 8,
    },

    // Blocks new sessions for archived accounts, so an archived user is
    // signed out immediately rather than only being rejected at next login.
    databaseHooks: {
        session: {
            create: {
                before: async (session) => {
                    const user = await prisma.user.findUnique({
                        where: { id: session.userId },
                        select: { isArchived: true },
                    });
                    if (user?.isArchived) return false;
                },
            },
        },
    },

    // Rate limiting defaults to production-only; the audit flagged auth
    // routes as having none at all, so it's turned on for every environment.
    rateLimit: {
        enabled: true,
        window: 60,
        max: 20,
        customRules: {
            "/sign-in/email": { window: 60, max: 10 },
            "/sign-up/email": { window: 60, max: 5 },
        },
    },
});

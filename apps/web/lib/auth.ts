import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { loginZodSchema } from "@workspace/validators";
import { normalizeString } from "@/utils/string-normalize";
import prisma from "@workspace/database";
import bcrypt from "bcrypt";
import { userAgent } from "next/server";

export const authOptions: AuthOptions = {
    // Configure one or more authentication providers
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                if (!credentials) throw new Error("Invalid credentials");

                if (!credentials.email || !credentials.password) {
                    throw new Error("Email and password are required");
                }

                const validateData = loginZodSchema.safeParse({
                    email: credentials.email,
                    password: credentials.password
                });

                if (!validateData.success) throw new Error("Invalid credentials");

                const { email: userEmail, password } = validateData.data;

                const email = normalizeString(userEmail);

                const existingUser = await prisma.user.findUnique({ where: { email } });

                if (!existingUser) {
                    const pendingUser = await prisma.pendingUser.findUnique({ where: { email } });

                    if (pendingUser) {
                        throw new Error("User registration is pending. Please check your email for OTP verification.");
                    }
                    throw new Error("Invalid credentials");
                }

                if (existingUser.isArchived) throw new Error("Your account has been archived.");

                if (!existingUser.isEmailVerified) {
                    throw new Error("Please verify your email address before logging in.");
                }

                const { id, userName, passwordHash } = existingUser;

                const validPassword = await bcrypt.compare(password, passwordHash);

                if (!validPassword) throw new Error("Invalid credentials");

                return {
                    id,
                    userName,
                    email,
                };
            }
        })
    ],

    pages: {
        signIn: "/signin",
    },

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && token.id) {
                session.user.id = token.id;
            }
            return session;
        },
    },
}
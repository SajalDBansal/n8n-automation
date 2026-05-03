import { auth } from "@/lib/auth";
import { archiveUserZodSchema } from "@workspace/validators";
import prisma from "@workspace/database";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";

export async function POST(request: Request) {
    const requestHeaders = await headers();
    const session = await auth.api.getSession({ headers: requestHeaders });

    if (!session) {
        return Response.json({
            success: false,
            message: "Unauthorized",
        }, { status: 401 })
    }

    const body = await request.json();

    const validateData = archiveUserZodSchema.safeParse(body);

    if (!validateData.success) {
        return Response.json({
            success: false,
            message: "Invalid data",
            errors: validateData.error.errors
        }, { status: 400 })
    }

    const { password } = validateData.data;

    // Re-verifies the password through the real sign-in path rather than
    // reaching into Better Auth's internal hashing, since it's the only
    // exposed way to check a password against the stored credential.
    try {
        await auth.api.signInEmail({
            body: { email: session.user.email, password },
            headers: requestHeaders,
        });
    } catch (error) {
        if (error instanceof APIError) {
            return Response.json({
                success: false,
                message: "Invalid password",
            }, { status: 401 })
        }
        throw error;
    }

    await prisma.user.update({
        where: { id: session.user.id },
        data: { isArchived: true },
    });

    // Kills every session for this user immediately (including the one just
    // created by the re-verification sign-in above), instead of letting an
    // already-logged-in session keep working until it naturally expires.
    await auth.api.revokeSessions({ headers: requestHeaders });

    return Response.json({
        success: true,
        message: "Account archived successfully",
    }, { status: 200 });
}

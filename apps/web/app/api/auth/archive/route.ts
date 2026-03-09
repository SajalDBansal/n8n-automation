import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { archiveUserZodSchema } from "@workspace/validators";
import prisma from "@workspace/database";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return Response.json({
            success: false,
            message: "Unauthorized",
        }, { status: 401 })
    }

    const { id } = session.user;

    const body = await request.json();

    const validateData = archiveUserZodSchema.safeParse(body);

    if (!validateData.success) {
        return Response.json({
            success: false,
            message: "Invalid data",
            errors: validateData.error.errors
        }, { status: 400 })
    }

    const { email, password } = validateData.data;

    const user = await prisma.user.findUnique({
        where: { id, email },
        select: { passwordHash: true }
    });

    if (!user) {
        return Response.json({
            success: false,
            message: "User not found",
        }, { status: 404 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
        return Response.json({
            success: false,
            message: "Invalid password",
        }, { status: 401 })
    }

    await prisma.user.update({
        where: { id },
        data: { isArchived: true, isEmailVerified: false }
    });

    return Response.json({
        success: true,
        message: "User archived successfully",
    }, { status: 200 });
}
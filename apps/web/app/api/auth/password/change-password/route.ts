import { authOptions } from "@/lib/auth";
import { normalizeString } from "@/utils/string-normalize";
import prisma from "@workspace/database";
import { changePasswordZodSchema } from "@workspace/validators";
import { getServerSession } from "next-auth";
import bcrypt from "bcrypt";
import config from "@/utils/config";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return Response.json({
            success: false,
            message: "Unauthorized",
        }, { status: 401 })
    }

    const { id: userId } = session.user;

    const body = await request.json();

    const validateData = changePasswordZodSchema.safeParse(body);

    if (!validateData.success) {
        return Response.json({
            success: false,
            message: "Invalid request data",
            errors: validateData.error.errors,
        }, { status: 400 })
    }

    const { email: userEmail, password, newPassword, confirmPassword } = validateData.data;

    const email = normalizeString(userEmail);

    const isUserExists = await prisma.user.findUnique({
        where: { email, id: userId, },
        select: { passwordHash: true, userName: true }
    });

    if (!isUserExists) {
        return Response.json({
            success: false,
            message: "User not found",
        }, { status: 404 })
    }

    const isPasswordValid = await bcrypt.compare(password, isUserExists.passwordHash);

    if (!isPasswordValid) {
        return Response.json({
            success: false,
            message: "Incorrect credentials",
        }, { status: 400 })
    }

    const newPasswordHash = await bcrypt.hash(newPassword, config.BCRYPT_SALT);

    await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash }
    });

    return Response.json({
        success: true,
        message: "Password changed successfully",
        user: {
            id: userId,
            userName: isUserExists.userName,
            email
        }
    }, { status: 200 });
}
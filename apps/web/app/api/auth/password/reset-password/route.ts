import config from "@/utils/config";
import { normalizeString } from "@/utils/string-normalize";
import prisma from "@workspace/database";
import { resetPasswordZodSchema, verifyJWT } from "@workspace/validators";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
    const body = await request.json();

    const validateData = resetPasswordZodSchema.safeParse(body);

    if (!validateData.success) {
        return Response.json({
            success: false,
            message: "Validation failed",
            errors: validateData.error.errors
        }, { status: 400 });
    }

    const { token, password } = validateData.data;

    const verifyToken = verifyJWT(token, config.JWT_FORGET_PASSWORD_SECRET);

    if (!verifyToken.success || !verifyToken.data) {
        return Response.json({
            success: false,
            message: "Invalid or expired token",
        }, { status: 400 });
    }

    const { id: userId } = verifyToken.data;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { passwordResetTokenExpiry: true, passwordResetTokenHash: true }
    });

    if (!user || !user.passwordResetTokenExpiry || !user.passwordResetTokenHash) {
        return Response.json({
            success: false,
            message: "Invalid or expired token",
        }, { status: 400 });
    }

    if (user.passwordResetTokenExpiry < new Date()) {
        return Response.json({
            success: false,
            message: "Token has expired",
        }, { status: 400 });
    }

    const isTokenValid = await bcrypt.compare(token, user.passwordResetTokenHash);

    if (!isTokenValid) {
        return Response.json({
            success: false,
            message: "Invalid token",
        }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, config.BCRYPT_SALT);

    await prisma.user.update({
        where: { id: userId },
        data: {
            passwordHash: passwordHash,
            passwordResetTokenHash: null,
            passwordResetTokenExpiry: null
        }
    });

    return Response.json({
        success: true,
        message: "Password reset successfully",
    }, { status: 200 });
}
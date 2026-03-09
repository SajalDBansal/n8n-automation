import config from "@/utils/config";
import { normalizeString } from "@/utils/string-normalize";
import prisma from "@workspace/database";
import { forgetPasswordZodSchema } from "@workspace/validators";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { getResetPasswordMailHtml } from "@/utils/mail-html";
import { sendEmail } from "@/lib/mail";

export async function POST(request: Request) {
    const body = await request.json();

    const validateData = forgetPasswordZodSchema.safeParse(body);

    if (!validateData.success) {
        return Response.json({
            success: false,
            message: "Validation failed",
            errors: validateData.error.errors
        }, { status: 400 })
    }

    const { email: userEmail } = validateData.data;

    const email = normalizeString(userEmail);

    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, userName: true }
    });

    if (!user) {
        return Response.json({
            success: false,
            message: "User with this email does not exist"
        }, { status: 400 })
    }

    const passwordResetToken = await jwt.sign({ userId: user.id }, config.JWT_FORGET_PASSWORD_SECRET, { expiresIn: "1h" });
    const passwordTokenHash = await bcrypt.hash(passwordResetToken, config.BCRYPT_SALT);
    const toeknExpiration = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
        where: { email },
        data: {
            passwordResetTokenHash: passwordTokenHash,
            passwordResetTokenExpiry: toeknExpiration
        }
    })

    const resetLink = `${config.FRONTEND_URL}/reset-password?token=${passwordResetToken}`;

    const FORGET_PASSWORD_EMAIL_TEMPLATE = getResetPasswordMailHtml(resetLink);

    await sendEmail(email, "Password Reset Request", `Click here: ${resetLink}`, FORGET_PASSWORD_EMAIL_TEMPLATE);

    return Response.json({
        success: true,
        message: "Password reset link sent successfully",
        resetLink
    }, { status: 200 });

}
import { normalizeString } from "@/utils/string-normalize";
import prisma from "@workspace/database";
import { verifyOTPZodSchema } from "@workspace/validators"
import bcrypt from "bcrypt";

export async function POST(request: Request) {
    const body = await request.json();

    const validateData = verifyOTPZodSchema.safeParse(body);

    if (!validateData.success) {
        return Response.json({
            success: false,
            message: "Invalid request data",
            errors: validateData.error.errors
        }, { status: 400 });
    }

    const { email: userEmail, otp } = validateData.data;

    const email = normalizeString(userEmail);

    const pendingUser = await prisma.pendingUser.findUnique({ where: { email } });

    if (!pendingUser) {
        return Response.json({
            success: false,
            message: "No pending user found with this email"
        }, { status: 404 });
    }

    if (pendingUser.otpExpiry < new Date()) {
        return Response.json({
            success: false,
            message: "OTP has expired. Please request a new one."
        }, { status: 400 });
    }

    const isOTPValid = await bcrypt.compare(otp, pendingUser.otpHash);

    if (!isOTPValid) {
        return Response.json({
            success: false,
            message: "Invalid OTP"
        }, { status: 400 });
    }

    const user = await prisma.user.create({
        data: {
            email,
            userName: pendingUser.userName,
            passwordHash: pendingUser.passwordHash,
            isEmailVerified: true,
        }, select: {
            id: true,
            email: true,
            userName: true,
        }
    });

    await prisma.pendingUser.delete({ where: { email } });

    return Response.json({
        success: true,
        message: "OTP verified successfully",
        data: user
    }, { status: 200 })
}
import { sendEmail } from "@/lib/mail";
import config from "@/utils/config";
import { generateOTP } from "@/utils/generate-otp";
import { getOtpMailHtml } from "@/utils/mail-html";
import { normalizeString } from "@/utils/string-normalize";
import prisma from "@workspace/database";
import { resendOTPZodSchema } from "@workspace/validators";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
    const body = await request.json();

    const validateData = resendOTPZodSchema.safeParse(body);

    if (!validateData.success) {
        return Response.json({
            success: false,
            message: "Invalid request data",
            errors: validateData.error.errors
        }, { status: 400 });
    }

    const { email: userEmail } = validateData.data;

    const email = normalizeString(userEmail);

    const pendingUser = await prisma.pendingUser.findUnique({
        where: { email },
        select: { email: true, id: true, userName: true }
    });

    if (!pendingUser) {
        return Response.json({
            success: false,
            message: "No pending user found with this email"
        }, { status: 404 });
    }

    const otp = generateOTP();

    const otpHash = await bcrypt.hash(otp, config.BCRYPT_SALT);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    await prisma.pendingUser.update({
        where: { email },
        data: {
            otpHash,
            otpExpiry
        }
    });

    const otpResetToken = jwt.sign({ userId: pendingUser.id }, config.JWT_OTP_SECRET, { expiresIn: "15m" });

    const OTP_EMAIL_TEMPLATE = getOtpMailHtml(otp);

    await sendEmail(email, "Your OTP for Email Verification", `Your OTP code is ${otp}`, OTP_EMAIL_TEMPLATE);

    return Response.json({
        success: true,
        message: "OTP sent for verification successfully",
        otp, // Note: In production, you should not return the OTP in the response. This is just for testing purposes.
        otpResetToken,
        user: pendingUser
    }, { status: 200 })

}
import { normalizeString } from "@/utils/string-normalize";
import { registerZodSchema } from "@workspace/validators";
import prisma from "@workspace/database";
import bcrypt from "bcrypt";
import config from "@/utils/config";
import { generateOTP } from "@/utils/generate-otp";
import { getOtpMailHtml } from "@/utils/mail-html";
import { sendEmail } from "@/lib/mail";

export async function GET(request: Request) {
    const body = await request.json();

    const validateData = registerZodSchema.safeParse(body);

    if (!validateData.success) {
        return Response.json({
            success: false,
            message: "Validation failed",
            errors: validateData.error.errors
        }, { status: 400 })
    }

    const { userName, email: userEmail, password } = validateData.data;

    const email = normalizeString(userEmail);

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
        return Response.json({
            success: false,
            message: "User with this email already exists"
        }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, config.BCRYPT_SALT);

    const otp = generateOTP();

    const otpHash = await bcrypt.hash(otp, config.BCRYPT_SALT);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    const user = await prisma.pendingUser.upsert({
        where: { email },
        update: {
            userName: userName.trim(),
            passwordHash,
            otpHash,
            otpExpiry
        },
        create: {
            userName: userName.trim(),
            email,
            passwordHash,
            otpHash,
            otpExpiry
        }, select: {
            id: true,
            userName: true,
            email: true
        }
    });

    const OTP_EMAIL_TEMPLATE = getOtpMailHtml(otp);

    await sendEmail(email, "OTP for Email Verification", `Your OTP code is ${otp}`, OTP_EMAIL_TEMPLATE);

    return Response.json({
        success: true,
        message: "OTP send for verification successfully",
        data: user
    }, { status: 200 })
}
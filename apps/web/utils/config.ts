if (!process.env.FRONTEND_URL) {
    throw new Error('FRONTEND_URL is not set');
}

if (!process.env.JWT_FORGET_PASSWORD_SECRET) {
    throw new Error('JWT_FORGET_PASSWORD_SECRET is not set');
}

if (!process.env.JWT_OTP_SECRET) {
    throw new Error('JWT_FORGET_PASSWORD_SECRET is not set');
}

const config = {
    FRONTEND_URL: process.env.FRONTEND_URL!,
    BCRYPT_SALT: Number(process.env.BCRYPT_SALT) || 10,
    JWT_FORGET_PASSWORD_SECRET: process.env.JWT_FORGET_PASSWORD_SECRET!,
    JWT_OTP_SECRET: process.env.JWT_OTP_SECRET!,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN!,
    GOOGLE_USER: process.env.GOOGLE_USER!,
}

export default config;
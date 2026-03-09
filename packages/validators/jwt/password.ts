import jwt from 'jsonwebtoken';

export function verifyJWT(token: string, secret: string) {
    try {
        const decoded = jwt.verify(token, secret);

        if (typeof decoded !== "object" || !("id" in decoded)) {
            return {
                success: false,
                error: "Invalid token payload",
            }
        }

        return {
            success: true,
            data: decoded as { id: string }
        };

    } catch (error) {
        return {
            success: false,
            error: "Invalid or expired token",
        };
    }
}
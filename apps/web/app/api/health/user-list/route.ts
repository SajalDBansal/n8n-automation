import prisma from "@workspace/database";
import { success } from "zod/v4-mini";

export async function GET() {
    const users = await prisma.user.findMany({});

    return Response.json({
        success: true,
        message: "User list retrieved successfully",
        data: users,
    })
}
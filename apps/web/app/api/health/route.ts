import { success } from "zod/v4-mini";

export async function GET() {
    return Response.json({
        success: true,
        message: "API is healthy",
    }, { status: 200 });
}
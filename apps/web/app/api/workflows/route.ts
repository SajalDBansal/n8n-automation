import { auth } from "@/lib/auth";
import prisma from "@workspace/database";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
        return NextResponse.json({
            success: false,
            message: "Unauthorized Request"
        }, { status: 401 })
    }

    const userId = session.user.id;

    try {
        const workflows = await prisma.workflow.findMany({
            where: { project: { is: { userId: userId } } },
            include: { project: { select: { id: true, name: true } } }
        })

        return NextResponse.json({
            success: true,
            message: "Workflows fetched successfully",
            workflows
        }, { status: 200 })

    } catch (error) {
        console.error("Error fetching workflows : ", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
        }, { status: 500 })
    }
}
import { authOptions } from "@/lib/auth";
import prisma from "@workspace/database";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

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
            message: "Projects fetched successfully",
            workflows
        }, { status: 200 })

    } catch (error) {
        console.error("Error in creating project : ", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
        }, { status: 500 })
    }
}
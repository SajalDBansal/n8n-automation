import { authOptions } from "@/lib/auth";
import prisma from "@workspace/database";
import { createProjectZodSchema } from "@workspace/validators";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({
            success: false,
            message: "Unauthorized Request"
        }, { status: 401 })
    }

    const userId = session.user.id;

    const validateData = createProjectZodSchema.safeParse(body);

    if (!validateData.success) {
        return NextResponse.json({
            success: false,
            message: "Validation Error",
            error: validateData.error.message
        }, { status: 400 })
    }

    const data = validateData.data;

    try {
        console.log(userId);

        const project = await prisma.project.create({ data: { ...data, userId: userId } });

        return NextResponse.json({
            success: true,
            message: "Project created successfully",
            project
        }, { status: 200 });

    } catch (error) {
        console.error("Error in creating project : ", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
        }, { status: 500 })
    }
}

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
        const projects = await prisma.project.findMany({
            where: { userId },
            include: { workflows: { select: { name: true, id: true } } }
        })

        return NextResponse.json({
            success: true,
            message: "Projects fetched successfully",
            projects
        }, { status: 200 })

    } catch (error) {
        console.error("Error in creating project : ", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
        }, { status: 500 })
    }

}


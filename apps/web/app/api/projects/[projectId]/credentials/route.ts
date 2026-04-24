import { authOptions } from "@/lib/auth";
import prisma from "@workspace/database";
import { createCredentialZodSchema } from "@workspace/validators";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
    const session = await getServerSession(authOptions);
    const { projectId } = await params;

    if (!session || !session.user) {
        return NextResponse.json({
            success: false,
            message: "Unauthorized Request"
        }, { status: 401 })
    }

    const userId = session.user.id;

    try {
        const isValidProject = await prisma.project.findFirst({
            where: { id: projectId, userId: userId }
        })

        if (!isValidProject) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized Request"
            }, { status: 401 })
        }

        const credentials = await prisma.credential.findMany({
            where: { projectId: projectId },
            select: { id: true, name: true, type: true, createdAt: true, updatedAt: true },
            orderBy: { updatedAt: "desc" }
        });

        const credentialsData = credentials.map(cred => ({
            ...cred,
            createdAt: cred.createdAt.toISOString(),
            updatedAt: cred.updatedAt.toISOString()
        }));

        return NextResponse.json({
            success: true,
            message: "Workflow added successfully",
            credentials: credentialsData
        }, { status: 200 })

    } catch (error) {
        console.error("Error creating workflow : ", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
        }, { status: 500 })
    }

}

export async function POST(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
    const session = await getServerSession(authOptions);
    const { projectId } = await params;

    if (!session || !session.user) {
        return NextResponse.json({
            success: false,
            message: "Unauthorized Request"
        }, { status: 401 })
    }

    const userId = session.user.id;

    try {

        const body = await request.json();
        const validationResult = createCredentialZodSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json({
                success: false,
                message: "Invalid request",
                error: validationResult.error.message
            }, { status: 400 })
        }

        const { name, type, data } = validationResult.data;

        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: userId
            }
        })

        if (!project) {
            return NextResponse.json({
                success: false,
                message: "Project Not Found"
            }, { status: 404 })
        }

        const credential = await prisma.credential.create({
            data: {
                projectId: projectId,
                name: name,
                type: type,
                data: data
            }
        })

        return NextResponse.json(
            {
                success: true,
                data: {
                    id: credential.id,
                    name: credential.name,
                    type: credential.type,
                    projectId: credential.projectId,
                    createdAt: credential.createdAt,
                },
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Error creating credential : ", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
        }, { status: 500 })
    }

}
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  { params }: Props
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: projectId } = await params;

    const currentUser = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const currentMembership =
      await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: currentUser.id,
            projectId,
          },
        },
      });

    if (
      !currentMembership ||
      !["OWNER", "ADMIN"].includes(currentMembership.role)
    ) {
      return NextResponse.json(
        { error: "You do not have permission to add members" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, role } = body;

    if (!email?.trim()) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email.trim(),
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No user found with that email" },
        { status: 404 }
      );
    }

    const existingMember =
      await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: user.id,
            projectId,
          },
        },
      });

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a project member" },
        { status: 409 }
      );
    }

    const member = await prisma.projectMember.create({
      data: {
        userId: user.id,
        projectId,
        role: role || "MEMBER",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await prisma.activity.create({
      data: {
        action: `Added ${user.name} to the project`,
        userId: currentUser.id,
        projectId,
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to add member" },
      { status: 500 }
    );
  }
}
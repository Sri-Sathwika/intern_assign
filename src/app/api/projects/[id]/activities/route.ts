import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
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

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this project" },
        { status: 403 }
      );
    }

    const activities = await prisma.activity.findMany({
      where: {
        projectId: id,
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
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
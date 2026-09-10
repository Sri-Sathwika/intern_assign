import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    id: string;
    memberId: string;
  }>;
};

export async function DELETE(
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

    const { id, memberId } = await params;

    const currentMembership =
      await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: user.id,
            projectId: id,
          },
        },
      });

    if (!currentMembership) {
      return NextResponse.json(
        { error: "You are not a member of this project" },
        { status: 403 }
      );
    }

    if (
      currentMembership.role !== "OWNER" &&
      currentMembership.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          error:
            "Only the owner or admin can remove members",
        },
        { status: 403 }
      );
    }

    const member = await prisma.projectMember.findUnique({
      where: {
        id: memberId,
      },
      include: {
        user: true,
      },
    });

    if (!member || member.projectId !== id) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    // The project owner cannot be removed
    if (member.role === "OWNER") {
      return NextResponse.json(
        {
          error: "The project owner cannot be removed",
        },
        { status: 400 }
      );
    }

    // Admins cannot remove other admins
    if (
      currentMembership.role === "ADMIN" &&
      member.role === "ADMIN"
    ) {
      return NextResponse.json(
        {
          error: "Admins cannot remove other admins",
        },
        { status: 403 }
      );
    }

    await prisma.projectMember.delete({
      where: {
        id: memberId,
      },
    });

    await prisma.activity.create({
      data: {
        action: `Removed ${member.user.name} from the project`,
        userId: user.id,
        projectId: id,
      },
    });

    return NextResponse.json({
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}
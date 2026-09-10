import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  return prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });
}

// GET PROJECT
export async function GET(
  request: Request,
  { params }: Props
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: {
        id,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

// UPDATE PROJECT
export async function PATCH(
  request: Request,
  { params }: Props
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: {
        id,
      },
      include: {
        members: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const membership = project.members.find(
      (member) => member.userId === user.id
    );

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this project" },
        { status: 403 }
      );
    }

    // Only OWNER and ADMIN can edit projects
    if (
      membership.role !== "OWNER" &&
      membership.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "You do not have permission to edit this project" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      name,
      description,
      status,
      startDate,
      endDate,
    } = body;

    if (name !== undefined && !name.trim()) {
      return NextResponse.json(
        { error: "Project name cannot be empty" },
        { status: 400 }
      );
    }

    if (
      status !== undefined &&
      !["ACTIVE", "COMPLETED", "ON_HOLD"].includes(status)
    ) {
      return NextResponse.json(
        { error: "Invalid project status" },
        { status: 400 }
      );
    }

    const updatedProject = await prisma.project.update({
      where: {
        id,
      },
      data: {
        ...(name !== undefined && {
          name: name.trim(),
        }),

        ...(description !== undefined && {
          description: description?.trim() || null,
        }),

        ...(status !== undefined && {
          status,
        }),

        ...(startDate !== undefined && {
          startDate: startDate
            ? new Date(startDate)
            : null,
        }),

        ...(endDate !== undefined && {
          endDate: endDate
            ? new Date(endDate)
            : null,
        }),
      },
    });

    await prisma.activity.create({
      data: {
        action: `Updated project "${updatedProject.name}"`,
        userId: user.id,
        projectId: updatedProject.id,
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE PROJECT
export async function DELETE(
  request: Request,
  { params }: Props
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: {
        id,
      },
      include: {
        members: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const membership = project.members.find(
      (member) => member.userId === user.id
    );

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this project" },
        { status: 403 }
      );
    }

    // Only OWNER can delete projects
    if (membership.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only the project owner can delete the project" },
        { status: 403 }
      );
    }

    await prisma.project.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
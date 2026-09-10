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

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check that the user belongs to the project
    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this project" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      title,
      description,
      priority,
      dueDate,
      assigneeId,
    } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      );
    }

    // If an assignee was provided, make sure they're
    // actually a member of this project.
    if (assigneeId) {
      const assigneeMembership =
        await prisma.projectMember.findUnique({
          where: {
            userId_projectId: {
              userId: assigneeId,
              projectId,
            },
          },
        });

      if (!assigneeMembership) {
        return NextResponse.json(
          {
            error:
              "The selected user is not a member of this project",
          },
          { status: 400 }
        );
      }
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId: assigneeId || null,
        projectId,
      },
      include: {
        assignee: true,
      },
    });

    await prisma.activity.create({
      data: {
        action: `Created task "${task.title}"`,
        userId: user.id,
        projectId,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
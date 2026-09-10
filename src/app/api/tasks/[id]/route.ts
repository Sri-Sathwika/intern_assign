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

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const membership = task.project.members.find(
      (member) => member.userId === user.id
    );

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
      status,
      priority,
      dueDate,
      assigneeId,
    } = body;

    if (
      status &&
      !["TODO", "IN_PROGRESS", "DONE"].includes(status)
    ) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    if (
      priority &&
      !["LOW", "MEDIUM", "HIGH"].includes(priority)
    ) {
      return NextResponse.json(
        { error: "Invalid priority" },
        { status: 400 }
      );
    }

    if (assigneeId) {
      const assigneeMembership =
        task.project.members.find(
          (member) => member.userId === assigneeId
        );

      if (!assigneeMembership) {
        return NextResponse.json(
          {
            error:
              "Assignee must be a member of this project",
          },
          { status: 400 }
        );
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },

      data: {
        ...(title !== undefined && {
          title: title.trim(),
        }),

        ...(description !== undefined && {
          description: description?.trim() || null,
        }),

        ...(status !== undefined && {
          status,
        }),

        ...(priority !== undefined && {
          priority,
        }),

        ...(dueDate !== undefined && {
          dueDate: dueDate
            ? new Date(dueDate)
            : null,
        }),

        ...(assigneeId !== undefined && {
          assigneeId: assigneeId || null,
        }),
      },

      include: {
        assignee: true,
      },
    });

    await prisma.activity.create({
      data: {
        action: `Updated task "${updatedTask.title}"`,
        userId: user.id,
        projectId: task.projectId,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

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

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const membership = task.project.members.find(
      (member) => member.userId === user.id
    );

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this project" },
        { status: 403 }
      );
    }

    await prisma.task.delete({
      where: { id },
    });

    await prisma.activity.create({
      data: {
        action: `Deleted task "${task.title}"`,
        userId: user.id,
        projectId: task.projectId,
      },
    });

    return NextResponse.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
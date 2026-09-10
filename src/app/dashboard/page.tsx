import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Get projects where the current user is a member
  const projects = await prisma.project.findMany({
    where: {
      members: {
        some: {
          userId: user.id,
        },
      },
    },
    include: {
      tasks: {
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          dueDate: true,
          projectId: true,
        },
      },
      _count: {
        select: {
          tasks: true,
          members: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  // Dashboard statistics
  const activeProjects = projects.filter(
    (project) => project.status === "ACTIVE"
  ).length;

  const completedProjects = projects.filter(
    (project) => project.status === "COMPLETED"
  ).length;

  const myTasks = await prisma.task.count({
    where: {
      assigneeId: user.id,
    },
  });

  const completedTasks = await prisma.task.count({
    where: {
      assigneeId: user.id,
      status: "DONE",
    },
  });

  // Task overview
  const taskStats = {
    todo: 0,
    inProgress: 0,
    done: 0,
  };

  projects.forEach((project) => {
    project.tasks.forEach((task) => {
      if (task.status === "TODO") {
        taskStats.todo++;
      }

      if (task.status === "IN_PROGRESS") {
        taskStats.inProgress++;
      }

      if (task.status === "DONE") {
        taskStats.done++;
      }
    });
  });

  // Upcoming tasks assigned to the current user
  const upcomingTasks = await prisma.task.findMany({
    where: {
      assigneeId: user.id,
      dueDate: {
        not: null,
      },
      status: {
        not: "DONE",
      },
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      dueDate: "asc",
    },
    take: 5,
  });

  // Recent activities from projects the user belongs to
  const recentActivities = await prisma.activity.findMany({
    where: {
      project: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const stats = [
    {
      title: "Active Projects",
      value: activeProjects,
    },
    {
      title: "Completed Projects",
      value: completedProjects,
    },
    {
      title: "My Tasks",
      value: myTasks,
    },
    {
      title: "Completed Tasks",
      value: completedTasks,
    },
  ];

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Welcome back
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              {user.name}
            </h1>
          </div>

          <Link
            href="/projects/new"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
          >
            + New Project
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-xl border p-6"
            >
              <p className="text-sm text-muted-foreground">
                {stat.title}
              </p>

              <p className="mt-2 text-3xl font-bold">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Task Overview */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Task Overview */}
          <div className="rounded-xl border p-6">
            <h2 className="text-xl font-bold">
              Task Overview
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-5">
                <p className="text-sm text-muted-foreground">
                  To Do
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {taskStats.todo}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-5">
                <p className="text-sm text-muted-foreground">
                  In Progress
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {taskStats.inProgress}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-5">
                <p className="text-sm text-muted-foreground">
                  Completed
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {taskStats.done}
                </p>
              </div>
            </div>
          </div>

          
        </div>

        {/* Recent Projects */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              Recent Projects
            </h2>

            <Link
              href="/projects"
              className="text-sm font-medium underline"
            >
              View all
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="mt-4 rounded-xl border p-8 text-center">
              <p className="text-muted-foreground">
                No projects yet.
              </p>

              <Link
                href="/projects/new"
                className="mt-4 inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
              >
                Create your first project
              </Link>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.slice(0, 6).map((project) => {
                const completed = project.tasks.filter(
                  (task) => task.status === "DONE"
                ).length;

                const progress =
                  project.tasks.length > 0
                    ? Math.round(
                      (completed /
                        project.tasks.length) *
                      100
                    )
                    : 0;

                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="rounded-xl border p-5 transition hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold">
                        {project.name}
                      </h3>

                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                        {project.status}
                      </span>
                    </div>

                    <p className="mt-4 text-sm text-muted-foreground">
                      {project._count.tasks} tasks ·{" "}
                      {project._count.members} members
                    </p>

                    <div className="mt-4">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>

                        <span>{progress}%</span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-black"
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Upcoming Tasks */}
          <div>
            <h2 className="text-xl font-bold">
              Upcoming Tasks
            </h2>

            <div className="mt-4 rounded-xl border">
              {upcomingTasks.length === 0 ? (
                <div className="p-6">
                  <p className="text-sm text-muted-foreground">
                    No upcoming tasks.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {upcomingTasks.map((task) => (
                    <Link
                      key={task.id}
                      href={`/projects/${task.project.id}`}
                      className="block p-5 transition hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium">
                            {task.title}
                          </p>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {task.project.name}
                          </p>
                        </div>

                        <span className="text-xs font-medium">
                          {task.priority}
                        </span>
                      </div>

                      {task.dueDate && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Due{" "}
                          {new Date(
                            task.dueDate
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-bold">
              Recent Activity
            </h2>

            <div className="mt-4 rounded-xl border">
              {recentActivities.length === 0 ? (
                <div className="p-6">
                  <p className="text-sm text-muted-foreground">
                    No recent activity.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="p-5"
                    >
                      <p className="text-sm">
                        <span className="font-semibold">
                          {activity.user.name}
                        </span>{" "}
                        {activity.action}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {activity.project.name} ·{" "}
                        {new Date(
                          activity.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
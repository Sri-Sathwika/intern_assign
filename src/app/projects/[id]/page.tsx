import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import TaskList from "@/components/TaskList";
import AddMember from "@/components/AddMember";
import DeleteProjectButton from "@/components/DeleteProjectButton";
import ActivityFeed from "@/components/ActivityFeed";
import RemoveMemberButton from "@/components/RemoveMemberButton";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function ProjectDetailsPage({ params }: Props) {
    const { id } = await params;

    const project = await prisma.project.findUnique({
        where: {
            id,
        },
        include: {
            members: {
                include: {
                    user: true,
                },
            },
            tasks: {
                include: {
                    assignee: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
            _count: {
                select: {
                    tasks: true,
                    members: true,
                },
            },
        },
    });

    if (!project) {
        notFound();
    }

    const completedTasks = project.tasks.filter(
        (task) => task.status === "DONE"
    ).length;

    const progress =
        project.tasks.length > 0
            ? Math.round((completedTasks / project.tasks.length) * 100)
            : 0;

    return (
        <main className="min-h-screen p-8">
            <div className="mx-auto max-w-7xl">
                {/* Back */}
                <Link
                    href="/projects"
                    className="text-sm text-muted-foreground hover:underline"
                >
                    ← Back to Projects
                </Link>

                {/* Project Header */}
                <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">
                                {project.name}
                            </h1>

                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                {project.status}
                            </span>
                        </div>

                        <p className="mt-2 max-w-2xl text-muted-foreground">
                            {project.description ||
                                "No description provided."}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href={`/projects/${project.id}/edit`}
                            className="rounded-md border px-4 py-2 text-sm font-medium"
                        >
                            Edit Project
                        </Link>

                        <DeleteProjectButton projectId={project.id} />
                    </div>
                </div>

                {/* Stats */}
                {/* <div className="mt-8 grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border p-6">
                        <p className="text-sm text-muted-foreground">
                            Total Tasks
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            {project._count.tasks}
                        </p>
                    </div>

                    <div className="rounded-xl border p-6">
                        <p className="text-sm text-muted-foreground">
                            Team Members
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            {project._count.members}
                        </p>
                    </div>

                    <div className="rounded-xl border p-6">
                        <p className="text-sm text-muted-foreground">
                            Progress
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            {progress}%
                        </p>
                    </div>
                </div> */}

                {/* Tasks */}
                <div className="mt-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">
                            Tasks
                        </h2>

                        <Link
                            href={`/projects/${project.id}/tasks/new`}
                            className="text-sm font-medium underline"
                        >
                            Add task
                        </Link>
                    </div>

                    <TaskList tasks={project.tasks} members={project.members} />
                </div>

                {/* Progress */}
                <div className="mt-10 border-t pt-6">
                    <div className="flex items-end justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">
                                Project Progress
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {completedTasks} of {project.tasks.length} tasks completed
                            </p>
                        </div>

                        <span className="text-2xl font-semibold">
                            {progress}%
                        </span>
                    </div>

                    <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                            className="h-full rounded-full bg-black transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>



                {/* Team */}
                <div className="mt-10 border-t pt-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">
                            Team Members
                        </h2>

                        <AddMember projectId={project.id} />
                    </div>

                    <div className="mt-5 border-y">
                        {/* Table Header */}
                        <div className="grid grid-cols-[2fr_2fr_1fr_1fr] border-b bg-muted/30 px-4 py-3 text-sm font-medium text-muted-foreground">
                            <span>Member</span>
                            <span>Email</span>
                            <span>Role</span>
                            <span>Action</span>
                        </div>

                        {/* Members */}
                        {project.members.map((member) => (
                            <div
                                key={member.id}
                                className="grid grid-cols-[2fr_2fr_1fr_1fr] items-center border-b px-4 py-4 last:border-b-0"
                            >
                                {/* Member */}
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                                        {member.user.name
                                            .split(" ")
                                            .map((name) => name[0])
                                            .join("")
                                            .slice(0, 2)
                                            .toUpperCase()}
                                    </div>

                                    <span className="font-medium">
                                        {member.user.name}
                                    </span>
                                </div>

                                {/* Email */}
                                <span className="text-sm text-muted-foreground">
                                    {member.user.email}
                                </span>

                                {/* Role */}
                                <span className="text-sm font-medium">
                                    {member.role}
                                </span>

                                {/* Action */}
                                <div>
                                    {member.role !== "OWNER" && (
                                        <RemoveMemberButton
                                            projectId={project.id}
                                            memberId={member.id}
                                            memberName={member.user.name}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Activity */}
                <div className="mt-10">
                    <h2 className="text-2xl font-bold">
                        Recent Activity
                    </h2>

                    <ActivityFeed projectId={project.id} />
                </div>
            </div>
        </main>
    );
}
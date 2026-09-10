"use client";

import { useState } from "react";
import { Check, ChevronDown, Circle } from "lucide-react";
import { useRouter } from "next/navigation";
import TaskActions from "@/components/TaskActions";

type Member = {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | string | null;
  assignee: {
    id: string;
    name: string;
    email: string;
  } | null;
  assigneeId: string | null;
};

type Props = {
  tasks: Task[];
  members: Member[];
};

const sections = [
  {
    key: "TODO",
    label: "To do",
  },
  {
    key: "IN_PROGRESS",
    label: "In progress",
  },
  {
    key: "DONE",
    label: "Done",
  },
];

export default function TaskList({
  tasks,
  members,
}: Props) {
  const router = useRouter();

  const [updatingTask, setUpdatingTask] = useState<
    string | null
  >(null);

  const [collapsedSections, setCollapsedSections] =
    useState<Record<string, boolean>>({});

  const [editingTask, setEditingTask] = useState<
    string | null
  >(null);

  async function updateStatus(
    taskId: string,
    status: string
  ) {
    setUpdatingTask(taskId);

    try {
      const response = await fetch(
        `/api/tasks/${taskId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        console.error(data.error);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingTask(null);
    }
  }

  function toggleSection(section: string) {
    setCollapsedSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  }

  function formatDueDate(
    dueDate: Date | string | null
  ) {
    if (!dueDate) {
      return "—";
    }

    return new Date(dueDate).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    );
  }

  function getPriorityClass(priority: string) {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-700";

      case "LOW":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-orange-100 text-orange-700";
    }
  }

  return (
    <div className="mt-4 overflow-hidden border-y">
      {/* Table Header */}
      <div className="grid grid-cols-[minmax(280px,1fr)_225px_190px_150px_160px] border-b text-sm text-muted-foreground">
        <div className="px-5 py-4">
          Name
        </div>

        <div className="border-l px-5 py-4">
          Assignee
        </div>

        <div className="border-l px-5 py-4">
          Due date
        </div>

        <div className="border-l px-5 py-4">
          Priority
        </div>

        <div className="border-l px-5 py-4">
          Actions
        </div>
      </div>

      {sections.map((section) => {
        const sectionTasks = tasks.filter(
          (task) => task.status === section.key
        );

        const isCollapsed =
          collapsedSections[section.key];

        return (
          <div key={section.key}>
            {/* Section Header */}
            <button
              type="button"
              onClick={() =>
                toggleSection(section.key)
              }
              className="flex w-full items-center gap-2 border-b bg-muted/30 px-5 py-4 text-left transition-colors hover:bg-muted/50"
            >
              <ChevronDown
                className={`cursor-pointer h-4 w-4 transition-transform ${
                  isCollapsed
                    ? "-rotate-90"
                    : "rotate-0"
                }`}
              />

              <span className="font-semibold">
                {section.label}
              </span>

              <span className="text-sm text-muted-foreground">
                {sectionTasks.length}
              </span>
            </button>

            {/* Section Content */}
            {!isCollapsed && (
              <>
                {sectionTasks.length === 0 ? (
                  <div className="border-b px-12 py-5 text-sm text-muted-foreground">
                    No tasks
                  </div>
                ) : (
                  sectionTasks.map((task) => (
                    <div
                      key={task.id}
                      className="grid grid-cols-[minmax(280px,1fr)_225px_190px_150px_160px] border-b last:border-b-0"
                    >
                      {/* Task Name */}
                      <div className="flex min-w-0 items-center gap-3 px-5 py-5">
                        <button
                          type="button"
                          onClick={() =>
                            updateStatus(
                              task.id,
                              task.status === "DONE"
                                ? "TODO"
                                : "DONE"
                            )
                          }
                          disabled={
                            updatingTask === task.id
                          }
                          className="shrink-0"
                          title={
                            task.status === "DONE"
                              ? "Mark as not done"
                              : "Mark as done"
                          }
                        >
                          {task.status === "DONE" ? (
                            <span className="cursor-pointer flex h-5 w-5 items-center justify-center rounded-full border-2 border-green-600 text-green-600">
                              <Check className="h-3 w-3" />
                            </span>
                          ) : (
                            <Circle className="cursor-pointer h-5 w-5 text-muted-foreground transition-colors hover:text-green-600" />
                          )}
                        </button>

                        <span
                          className={`truncate text-sm font-medium ${
                            task.status === "DONE"
                              ? "text-muted-foreground line-through"
                              : ""
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      {/* Assignee */}
                      <div className="flex items-center border-l px-5 py-5">
                        {task.assignee ? (
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-700">
                              {task.assignee.name
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>

                            <span className="truncate text-sm">
                              {task.assignee.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Unassigned
                          </span>
                        )}
                      </div>

                      {/* Due Date */}
                      <div className="flex items-center border-l px-5 py-5">
                        <span className="text-sm text-muted-foreground">
                          {formatDueDate(
                            task.dueDate
                          )}
                        </span>
                      </div>

                      {/* Priority */}
                      <div className="flex items-center border-l px-5 py-5">
                        <span
                          className={`rounded-md px-2.5 py-1 text-xs font-medium ${getPriorityClass(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {/* Actions + Inline Editor */}
                      <TaskActions
                        task={task}
                        members={members}
                        editing={
                          editingTask === task.id
                        }
                        onEdit={() =>
                          setEditingTask(task.id)
                        }
                        onCancel={() =>
                          setEditingTask(null)
                        }
                      />
                    </div>
                  ))
                )}

                
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
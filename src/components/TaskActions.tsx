"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Member = {
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
  assigneeId: string | null;
};

type Props = {
  task: Task;
  members: Member[];
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
};

export default function TaskActions({
  task,
  members,
  editing,
  onEdit,
  onCancel,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState(task.title);

  const [description, setDescription] =
    useState(task.description || "");

  const [priority, setPriority] = useState(
    task.priority
  );

  const [status, setStatus] = useState(
    task.status
  );

  const [assigneeId, setAssigneeId] =
    useState(task.assigneeId || "");

  const [error, setError] = useState("");

  async function handleUpdate() {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `/api/tasks/${task.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
            priority,
            status,
            assigneeId: assigneeId || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Failed to update task"
        );
        return;
      }

      onCancel();
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `/api/tasks/${task.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();

        setError(
          data.error || "Failed to delete task"
        );

        return;
      }

      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Actions */}
      <div className="flex items-center gap-2 border-l px-5 py-5">
        <button
          type="button"
          onClick={onEdit}
          disabled={loading}
          className="rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
        >
          {loading ? "Deleting..." : "Delete"}
        </button>
      </div>

      {/* Full-width inline editor */}
      {editing && (
        <div className="col-span-full border-t bg-muted/20 px-6 py-5">
          <div className="mx-auto max-w-5xl">
            <div className="mb-4">
              <h3 className="text-base font-semibold">
                Edit task
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Update the task details below.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Task title
                </label>

                <input
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-purple-500"
                  placeholder="Task title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  rows={2}
                  className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-purple-500"
                  placeholder="Add a description..."
                />
              </div>

              {/* Options */}
              <div className="grid gap-4 md:grid-cols-3">
                {/* Status */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Status
                  </label>

                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value)
                    }
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="TODO">
                      To Do
                    </option>

                    <option value="IN_PROGRESS">
                      In Progress
                    </option>

                    <option value="DONE">
                      Done
                    </option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Priority
                  </label>

                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value)
                    }
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="LOW">
                      Low
                    </option>

                    <option value="MEDIUM">
                      Medium
                    </option>

                    <option value="HIGH">
                      High
                    </option>
                  </select>
                </div>

                {/* Assignee */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Assignee
                  </label>

                  <select
                    value={assigneeId}
                    onChange={(e) =>
                      setAssigneeId(e.target.value)
                    }
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">
                      Unassigned
                    </option>

                    {members.map((member) => (
                      <option
                        key={member.user.id}
                        value={member.user.id}
                      >
                        {member.user.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={loading}
                  className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={loading}
                  className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {loading
                    ? "Saving..."
                    : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
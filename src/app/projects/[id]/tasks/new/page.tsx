"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Member = {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export default function NewTaskPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = params.id as string;

  const [members, setMembers] = useState<Member[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProjectMembers();
  }, []);

  async function fetchProjectMembers() {
    try {
      const response = await fetch(
        `/api/projects/${projectId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch project");
      }

      const project = await response.json();

      setMembers(project.members || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMembers(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `/api/projects/${projectId}/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
            priority,
            dueDate,
            assigneeId: assigneeId || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Failed to create task"
        );
        return;
      }

      router.push(`/projects/${projectId}`);
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href={`/projects/${projectId}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to Project
        </Link>

        <h1 className="mt-6 text-3xl font-bold">
          Create Task
        </h1>

        <p className="mt-2 text-muted-foreground">
          Add a new task to this project.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-xl border p-6"
        >
          {error && (
            <div className="rounded-md bg-red-100 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-sm font-medium">
              Task Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="e.g. Design login page"
              className="mt-2 w-full rounded-md border p-3"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Describe what needs to be done..."
              rows={4}
              className="mt-2 w-full rounded-md border p-3"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="text-sm font-medium">
              Priority
            </label>

            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value)
              }
              className="mt-2 w-full rounded-md border p-3"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          {/* Assignee */}
          <div>
            <label className="text-sm font-medium">
              Assign To
            </label>

            <select
              value={assigneeId}
              onChange={(e) =>
                setAssigneeId(e.target.value)
              }
              className="mt-2 w-full rounded-md border p-3"
            >
              <option value="">
                Unassigned
              </option>

              {!loadingMembers &&
                members.map((member) => (
                  <option
                    key={member.user.id}
                    value={member.user.id}
                  >
                    {member.user.name} (
                    {member.user.email})
                  </option>
                ))}
            </select>
          </div>

          {/* Due date */}
          <div>
            <label className="text-sm font-medium">
              Due Date
            </label>

            <input
              type="date"
              value={dueDate}
              onChange={(e) =>
                setDueDate(e.target.value)
              }
              className="mt-2 w-full rounded-md border p-3"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-black p-3 font-medium text-white disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Task"}
          </button>
        </form>
      </div>
    </main>
  );
}
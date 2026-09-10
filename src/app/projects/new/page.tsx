"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewProjectPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          startDate,
          endDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create project");
        return;
      }

      router.push(`/projects/${data.id}`);
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
          href="/projects"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to Projects
        </Link>

        <h1 className="mt-6 text-3xl font-bold">
          Create Project
        </h1>

        <p className="mt-2 text-muted-foreground">
          Create a new project for your team.
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

          <div>
            <label className="text-sm font-medium">
              Project Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. NOVA Website"
              className="mt-2 w-full rounded-md border p-3"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
              rows={4}
              className="mt-2 w-full rounded-md border p-3"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">
                Start Date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-2 w-full rounded-md border p-3"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                End Date
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-2 w-full rounded-md border p-3"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-black p-3 font-medium text-white disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Project"}
          </button>
        </form>
      </div>
    </main>
  );
}
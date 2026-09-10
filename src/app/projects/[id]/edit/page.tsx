"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = params.id as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch(
          `/api/projects/${projectId}`
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to load project");
          return;
        }

        setName(data.name || "");
        setDescription(data.description || "");
        setStatus(data.status || "ACTIVE");

        if (data.startDate) {
          setStartDate(
            new Date(data.startDate)
              .toISOString()
              .split("T")[0]
          );
        }

        if (data.endDate) {
          setEndDate(
            new Date(data.endDate)
              .toISOString()
              .split("T")[0]
          );
        }
      } catch (error) {
        console.error(error);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [projectId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setSaving(true);

    try {
      const response = await fetch(
        `/api/projects/${projectId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description,
            status,
            startDate,
            endDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update project");
        return;
      }

      router.push(`/projects/${projectId}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen p-8">
        <div className="mx-auto max-w-2xl">
          <p className="text-muted-foreground">
            Loading project...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() =>
            router.push(`/projects/${projectId}`)
          }
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to Project
        </button>

        <div className="mt-6">
          <h1 className="text-3xl font-bold">
            Edit Project
          </h1>

          <p className="mt-2 text-muted-foreground">
            Update your project details and status.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-xl border p-6"
        >
          {/* Project Name */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Project Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2"
              placeholder="Enter project name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              rows={4}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2"
              placeholder="Describe your project"
            />
          </div>

          {/* Status */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Status
            </label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="ACTIVE">
                Active
              </option>
              
              <option value="ON_HOLD">
                On Hold
              </option>

              <option value="COMPLETED">
                Completed
              </option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Start Date
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(e) =>
                setStartDate(e.target.value)
              }
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              End Date
            </label>

            <input
              type="date"
              value={endDate}
              onChange={(e) =>
                setEndDate(e.target.value)
              }
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-black px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(`/projects/${projectId}`)
              }
              className="rounded-md border px-5 py-2 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  projectId: string;
};

export default function AddMember({ projectId }: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `/api/projects/${projectId}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            role,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to add member");
        return;
      }

      setEmail("");
      setRole("MEMBER");
      setOpen(false);
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      {/* Add Member trigger */}
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          setError("");
        }}
        className="cursor-pointer text-sm font-medium hover:underline"
      >
        + Add member
      </button>

      {/* Popup */}
      {open && (
        <>
          {/* Invisible backdrop */}
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />

          <div className="absolute right-0 top-8 z-50 w-80 border bg-background p-5 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">
                  Add Team Member
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Add a member to this project.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-lg leading-none text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-5 space-y-4"
            >
              {/* Email */}
              <div>
                <label className="text-sm font-medium">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="Enter user's email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="mt-2 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-1"
                  required
                />
              </div>

              {/* Role */}
              <div>
                <label className="text-sm font-medium">
                  Role
                </label>

                <select
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value)
                  }
                  className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="MEMBER">
                    Member
                  </option>

                  <option value="ADMIN">
                    Admin
                  </option>
                </select>
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-600">
                  {error}
                </p>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md border px-3 py-2 text-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {loading
                    ? "Adding..."
                    : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
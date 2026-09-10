"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  projectId: string;
};

export default function DeleteProjectButton({
  projectId,
}: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project? This will also delete all its tasks and team memberships."
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(
        `/api/projects/${projectId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to delete project");
        return;
      }

      router.push("/projects");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="cursor-pointer rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {deleting ? "Deleting..." : "Delete Project"}
    </button>
  );
}
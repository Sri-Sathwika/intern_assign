"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  projectId: string;
  memberId: string;
  memberName: string;
};

export default function RemoveMemberButton({
  projectId,
  memberId,
  memberName,
}: Props) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);

  async function handleRemove() {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${memberName} from this project?`
    );

    if (!confirmed) {
      return;
    }

    setRemoving(true);

    try {
      const response = await fetch(
        `/api/projects/${projectId}/members/${memberId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to remove member");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <button
      onClick={handleRemove}
      disabled={removing}
      className="cursor-pointer mt-3 text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
    >
      {removing ? "Removing..." : "Remove member"}
    </button>
  );
}
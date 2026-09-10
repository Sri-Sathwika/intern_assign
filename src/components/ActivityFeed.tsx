"use client";

import { useEffect, useState } from "react";

type Activity = {
  id: string;
  action: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

type Props = {
  projectId: string;
};

export default function ActivityFeed({
  projectId,
}: Props) {
  const [activities, setActivities] = useState<Activity[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const response = await fetch(
          `/api/projects/${projectId}/activities`
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setActivities(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
  }, [projectId]);

  if (loading) {
    return (
      <div className="mt-4 rounded-xl border p-6">
        <p className="text-sm text-muted-foreground">
          Loading activity...
        </p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="mt-4 rounded-xl border p-6">
        <p className="text-sm text-muted-foreground">
          No activity yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border">
      <div className="divide-y">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex gap-4 p-5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold">
              {activity.user.name
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="text-sm">
                <span className="font-semibold">
                  {activity.user.name}
                </span>{" "}
                {activity.action}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(
                  activity.createdAt
                ).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
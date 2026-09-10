"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  _count: {
    tasks: number;
    members: number;
  };
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const response = await fetch("/api/projects");

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>

            <p className="mt-2 text-muted-foreground">
              Manage your team's projects.
            </p>
          </div>

          <Link
            href="/projects/new"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
          >
            + New Project
          </Link>
        </div>

        {loading ? (
          <div className="mt-8">
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed p-12 text-center">
            <h2 className="text-xl font-semibold">
              No projects yet
            </h2>

            <p className="mt-2 text-muted-foreground">
              Create your first project to get started.
            </p>

            <Link
              href="/projects/new"
              className="mt-6 inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
            >
              Create Project
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="rounded-xl border p-6 transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-semibold">
                    {project.name}
                  </h2>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    {project.status}
                  </span>
                </div>

                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                  {project.description ||
                    "No description provided."}
                </p>

                <div className="mt-6 flex gap-6 text-sm text-muted-foreground">
                  <span>
                    {project._count.tasks} tasks
                  </span>

                  <span>
                    {project._count.members} members
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
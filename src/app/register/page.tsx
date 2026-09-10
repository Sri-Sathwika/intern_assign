"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await response.json();

    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Registration failed");
      return;
    }

    router.push("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-xl border p-8">
        <div>
          <h1 className="text-3xl font-bold">
            Create your account
          </h1>

          <p className="mt-2 text-muted-foreground">
            Join NOVA and start managing your projects.
          </p>
        </div>

        {error && (
          <p className="rounded-md bg-red-100 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border p-3"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border p-3"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border p-3"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer w-full rounded-md bg-black p-3 text-white"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <a href="/login" className="font-medium underline">
            Login
          </a>
        </p>
      </div>
    </main>
  );
}
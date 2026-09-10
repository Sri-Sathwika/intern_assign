"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-xl border p-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome back</h1>

          <p className="mt-2 text-muted-foreground">
            Login to your NOVA workspace.
          </p>
        </div>

        {error && (
          <p className="rounded-md bg-red-100 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm">
          Don't have an account?{" "}
          <a href="/register" className="font-medium underline">
            Create one
          </a>
        </p>
      </div>
    </main>
  );
}
"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
export default function Navbar() {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === "loading" || !session) {
        return null;
    }

    async function handleSignOut() {
        await signOut({
            redirect: false,
        });

        router.push("/login");
        router.refresh();
    }

    return (
        <nav className="border-b bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-6">
                {/* Logo */}
                <Link
                    href="/dashboard"
                    className="shrink-0 text-3xl"
                >
                    NOVA
                </Link>

                {/* Navigation */}
                <div className="flex shrink-0 items-center gap-3 sm:gap-6">
                    <Link
                        href="/dashboard"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                        Dashboard
                    </Link>

                    <Link
                        href="/projects"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                        Projects
                    </Link>

                    {/* User */}
                    <div className="flex items-center gap-3 border-l pl-6">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-medium">
                                {session.user?.name}
                            </p>

                            <p className="text-xs text-muted-foreground">
                                {session.user?.email}
                            </p>
                        </div>

                        <button
                            onClick={handleSignOut}
                            className="cursor-pointer rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
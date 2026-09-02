
"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut();

    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="flex items-center justify-between border-b px-8 py-4">
      <Link href="/dashboard" className="text-xl font-bold">
        Next Match
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          Dashboard
        </Link>

        <Link href="/dashboard/discover">
          Scopri persone
        </Link>

        <Link href="/dashboard/matches">
          Match 💕
        </Link>

        <Link href="/dashboard/profile">
          Il mio profilo
        </Link>

        <button
          onClick={handleLogout}
          className="rounded bg-black px-4 py-2 text-white"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}


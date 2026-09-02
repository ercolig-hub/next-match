
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { PrismaClient } from "../../../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import Link from "next/link";

import LikeButton from "@/components/LikeButton";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

export default async function DiscoverPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const profiles = await prisma.profile.findMany({
    where: {
      userId: {
        not: session.user.id,
      },
    },
    include: {
      user: true,
    },
  });

  return (
    <main className="mx-auto max-w-5xl p-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Scopri persone
        </h1>

        <Link
          href="/dashboard/profile"
          className="rounded border px-4 py-2 hover:bg-gray-100"
        >
          Modifica profilo
        </Link>
      </div>

      {profiles.length === 0 ? (
        <p className="mt-8 text-gray-500">
          Non ci sono ancora altri profili.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="rounded-xl border p-6 shadow-sm"
            >
              <h2 className="text-xl font-bold">
                {profile.user.name}
                {profile.age && `, ${profile.age}`}
              </h2>

              {profile.city && (
                <p className="mt-1 text-gray-500">
                  📍 {profile.city}
                </p>
              )}

              {profile.bio && (
                <p className="mt-4">
                  {profile.bio}
                </p>
              )}

              <LikeButton userId={profile.userId} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}


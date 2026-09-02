
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function MatchesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const matches = await prisma.match.findMany({
    where: {
      OR: [
        {
          user1Id: session.user.id,
        },
        {
          user2Id: session.user.id,
        },
      ],
    },
    include: {
      user1: {
        include: {
          profile: true,
        },
      },
      user2: {
        include: {
          profile: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="mx-auto max-w-5xl p-10">
      <h1 className="text-3xl font-bold">
        I miei Match 💕
      </h1>

      {matches.length === 0 ? (
        <p className="mt-8 text-gray-500">
          Non hai ancora nessun Match.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => {
            const otherUser =
              match.user1Id === session.user.id
                ? match.user2
                : match.user1;

            return (
              <div
                key={match.id}
                className="rounded-xl border p-6 shadow-sm"
              >
                {otherUser.image ? (
                  <img
                    src={otherUser.image}
                    alt={otherUser.name ?? "Profilo"}
                    className="mx-auto h-32 w-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gray-200 text-4xl">
                    👤
                  </div>
                )}

                <h2 className="mt-4 text-center text-xl font-bold">
                  {otherUser.name}

                  {otherUser.profile?.age &&
                    `, ${otherUser.profile.age}`}
                </h2>

                {otherUser.profile?.city && (
                  <p className="mt-1 text-center text-gray-500">
                    📍 {otherUser.profile.city}
                  </p>
                )}

                {otherUser.profile?.bio && (
                  <p className="mt-4 text-center">
                    {otherUser.profile.bio}
                  </p>
                )}

                <Link
                  href={`/dashboard/matches/${match.id}`}
                  className="mt-6 block w-full rounded bg-pink-500 px-4 py-2 text-center text-white"
                >
                  💬 Invia messaggio
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}


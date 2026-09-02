import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json(
      { error: "Non autorizzato" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const toUserId = body.toUserId;

  if (!toUserId) {
    return NextResponse.json(
      { error: "Utente destinatario mancante" },
      { status: 400 }
    );
  }

  if (toUserId === session.user.id) {
    return NextResponse.json(
      { error: "Non puoi mettere Like a te stesso" },
      { status: 400 }
    );
  }

  const fromUserId = session.user.id;

  // Controlliamo se hai già messo Like
  const existingLike = await prisma.like.findFirst({
    where: {
      fromUserId,
      toUserId,
    },
  });

  if (existingLike) {
    return NextResponse.json(
      { error: "Hai già messo Like" },
      { status: 400 }
    );
  }

  // Creiamo il Like
  await prisma.like.create({
    data: {
      fromUserId,
      toUserId,
    },
  });

  // Cerchiamo il Like reciproco
  const reciprocalLike = await prisma.like.findFirst({
    where: {
      fromUserId: toUserId,
      toUserId: fromUserId,
    },
  });

  console.log("Like corrente:", fromUserId, "→", toUserId);
  console.log("Like reciproco:", reciprocalLike);

  // Se esiste il Like reciproco, creiamo il Match
  if (reciprocalLike) {
    const [user1Id, user2Id] = [fromUserId, toUserId].sort();

    const existingMatch = await prisma.match.findFirst({
      where: {
        user1Id,
        user2Id,
      },
    });

    const match =
      existingMatch ??
      (await prisma.match.create({
        data: {
          user1Id,
          user2Id,
        },
      }));

    console.log("💕 MATCH:", match);

    return NextResponse.json({
      liked: true,
      matched: true,
      match,
    });
  }

  return NextResponse.json({
    liked: true,
    matched: false,
  });
}
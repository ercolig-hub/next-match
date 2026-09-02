import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autenticato" },
        { status: 401 }
      );
    }

    const { matchId } = await params;
    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Il messaggio è vuoto" },
        { status: 400 }
      );
    }

    const match = await prisma.match.findUnique({
      where: {
        id: matchId,
      },
    });

    if (!match) {
      return NextResponse.json(
        { error: "Match non trovato" },
        { status: 404 }
      );
    }

    const isParticipant =
      match.user1Id === session.user.id ||
      match.user2Id === session.user.id;

    if (!isParticipant) {
      return NextResponse.json(
        { error: "Non puoi scrivere in questa chat" },
        { status: 403 }
      );
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        matchId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autenticato" },
        { status: 401 }
      );
    }

    const { matchId } = await params;

    const match = await prisma.match.findUnique({
      where: {
        id: matchId,
      },
    });

    if (!match) {
      return NextResponse.json(
        { error: "Match non trovato" },
        { status: 404 }
      );
    }

    const isParticipant =
      match.user1Id === session.user.id ||
      match.user2Id === session.user.id;

    if (!isParticipant) {
      return NextResponse.json(
        { error: "Non puoi vedere questa chat" },
        { status: 403 }
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        matchId,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
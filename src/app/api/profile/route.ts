
import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

import { PrismaClient } from "../../../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

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

  // Salviamo la foto nell'utente
  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      image: body.image || null,
    },
  });

  // Creiamo o aggiorniamo il profilo
  const profile = await prisma.profile.upsert({
    where: {
      userId: session.user.id,
    },
    update: {
      bio: body.bio,
      age: body.age,
      city: body.city,
    },
    create: {
      userId: session.user.id,
      bio: body.bio,
      age: body.age,
      city: body.city,
    },
  });

  return NextResponse.json(profile);
}

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json(
      { error: "Non autorizzato" },
      { status: 401 }
    );
  }

  const profile = await prisma.profile.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      user: true,
    },
  });

  return NextResponse.json(profile);
}
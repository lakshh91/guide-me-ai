import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET all sessions for authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json([], { status: 401 });
    }

    const sessions = await prisma.chatSession.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true },
    });
    return NextResponse.json(sessions);
  } catch (err) {
    console.error(err);
    return NextResponse.json([], { status: 500 });
  }
}

// POST create a new session
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const newSession = await prisma.chatSession.create({
      data: { 
        title: "Untitled Chat",
        userId: session.user.id
      },
      select: { id: true, title: true },
    });
    return NextResponse.json(newSession);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

// PATCH rename session
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, title } = await req.json();
    if (!id || !title) return NextResponse.json({ error: "Missing id or title" }, { status: 400 });

    const updated = await prisma.chatSession.update({
      where: { 
        id,
        userId: session.user.id // Ensure user owns this session
      },
      data: { title },
      select: { id: true, title: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}

// DELETE session
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await prisma.$transaction([
      prisma.message.deleteMany({ where: { sessionId: id } }),
      prisma.chatSession.delete({ 
        where: { 
          id,
          userId: session.user.id // Ensure user owns this session
        }
      }),
    ]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}

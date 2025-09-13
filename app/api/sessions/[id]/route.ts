import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id || (session as any).user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const chatSession = await prisma.chatSession.findUnique({
      where: { 
        id,
        userId: userId // Ensure user owns this session
      },
      include: { messages: true },
    });

    if (!chatSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(chatSession);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id || (session as any).user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { title } = await req.json();
    const chatSession = await prisma.chatSession.update({
      where: { 
        id,
        userId: userId // Ensure user owns this session
      },
      data: { title },
    });
    return NextResponse.json(chatSession);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id || (session as any).user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.$transaction([
      prisma.message.deleteMany({ where: { sessionId: id } }),
      prisma.chatSession.delete({ 
        where: { 
          id,
          userId: userId // Ensure user owns this session
        }
      }),
    ]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}

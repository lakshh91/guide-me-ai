import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

// Use Node.js runtime to ensure Prisma compatibility and stable streaming
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    const { sessionId, message } = await req.json();

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Find the session and verify user ownership
          const chatSession = await prisma.chatSession.findUnique({ 
            where: { 
              id: sessionId,
              userId: userId // Ensure user owns this session
            } 
          });
          if (!chatSession) {
            controller.enqueue(encoder.encode("Session not found or access denied"));
            controller.close();
            return;
          }

        // ⚡ Use streaming API directly
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContentStream(message);

        let fullReply = "";

        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            fullReply += text;
            controller.enqueue(encoder.encode(text)); // send chunk to client
          }
        }

        // Persist messages and title asynchronously after streaming
        const maybeTitle = chatSession.title === "Untitled Chat"
          ? message.split(" ").slice(0, 6).join(" ") + (message.split(" ").length > 6 ? "…" : "")
          : null;

        await Promise.allSettled([
          prisma.message.create({ data: { role: "user", content: message, sessionId } }),
          prisma.message.create({ data: { role: "assistant", content: fullReply, sessionId } }),
          maybeTitle
            ? prisma.chatSession.update({ where: { id: sessionId }, data: { title: maybeTitle } })
            : Promise.resolve(),
        ]);

        controller.close();
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        controller.enqueue(encoder.encode(`\n[Error: ${errorMessage}]`));
        controller.close();
      }
    },
  });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

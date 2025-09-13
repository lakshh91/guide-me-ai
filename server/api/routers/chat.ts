import { z } from "zod";
import { router, publicProcedure } from "../trpc";

const systemPrompt = `You are an expert career counselor. Provide practical, empathetic, and concise guidance.
- Ask clarifying questions when needed.
- Be specific with resources, steps, and timelines.
- Tailor advice to the user's background and goals.
- Avoid fluff; focus on actionable next steps.`;

export const chatRouter = router({
  reply: publicProcedure
    .input(z.object({
      messages: z.array(
        z.object({
          role: z.enum(["system", "user", "assistant"]),
          content: z.string(),
        })
      ).min(1),
      model: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("Missing OPENAI_API_KEY");
      }

      const model = input.model ?? "gpt-4o-mini";

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.3,
          messages: [
            { role: "system", content: systemPrompt },
            ...input.messages,
          ],
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`OpenAI error: ${res.status} ${text}`);
      }

      const data = await res.json();
      const reply: string = data?.choices?.[0]?.message?.content?.trim() ?? "";
      return { reply };
    }),
});

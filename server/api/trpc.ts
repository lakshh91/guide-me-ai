import { initTRPC } from "@trpc/server";

const t = initTRPC.create({
  errorFormatter({ shape, error }) {
    // Attach original error message for debugging
    return {
      ...shape,
      message: `${shape.message}${error.cause ? `: ${String(error.cause)}` : ""}`,
      data: {
        ...shape.data,
        code: shape.data.code,
        zodError: (error as any).zodError,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

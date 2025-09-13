import { router, publicProcedure } from "./trpc";

export const appRouter = router({
  hello: publicProcedure.query(() => {
    return { message: "Hello from tRPC" };
  }),
});

export type AppRouter = typeof appRouter;

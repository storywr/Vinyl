import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const commentsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const comments = await ctx.db.comment.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }],
    });

    return comments;
  }),
});

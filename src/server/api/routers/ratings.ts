import { z } from "zod";

import { createTRPCRouter, publicProcedure, privateProcedure } from "~/server/api/trpc";

export const ratingsRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const authorId = ctx.userId as string;
      const rating = await ctx.prisma.rating.findFirst({
        where: { authorId, albumId: input.id },
      });

      return rating;
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    const ratings = await ctx.prisma.rating.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }],
    });

    return ratings;
  }),
  create: privateProcedure
    .input(
      z.object({
        albumId: z.string(),
        value: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const rating = await ctx.prisma.rating.create({
        data: {
          authorId,
          albumId: input.albumId,
          value: input.value,
        },
      });

      return rating;
    }),
});

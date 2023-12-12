import { z } from "zod";

import { createTRPCRouter, publicProcedure, privateProcedure } from "~/server/api/trpc";

const fetchAlbums = async (albumIds: string[], access_token: string) => {
  const response = await fetch(`https://api.spotify.com/v1/albums?ids=${albumIds.join(',')}`, {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + access_token },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch albums');
  }
  return response.json();
};

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
  getRatingsByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        access_token: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const ratings = await ctx.prisma.rating
        .findMany({
          where: {
            authorId: input.userId,
          },
          take: 20,
          orderBy: [{ createdAt: "desc" }],
        })
      
      const albumIds = ratings.map((rating) => rating.albumId);
      const albums = await fetchAlbums(albumIds, input.access_token);
      const fullRatings = ratings.map((rating) => ({ ...rating, album: albums.albums.find((album) => album.id === rating.albumId) }))

      return fullRatings;
    }),
  getTopRated: publicProcedure.query(async ({ ctx }) => {
    const ratings = await ctx.prisma.rating.findMany({
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
  update: privateProcedure
    .input(
      z.object({
        id: z.string(),
        albumId: z.string(),
        value: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const rating = await ctx.prisma.rating.update({
        where: { id: input.id },
        data: {
          authorId,
          albumId: input.albumId,
          value: input.value,
        },
      });

      return rating;
    }),
});

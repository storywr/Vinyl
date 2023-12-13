import { clerkClient } from "@clerk/nextjs";
import { Comment } from "@prisma/client";
import { z } from "zod";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

const addUserDataToComments = async (comments: Comment[]) => {
  const userId = comments.map((post) => post.authorId);
  const users = (
    await clerkClient.users.getUserList({
      userId: userId,
      limit: 110,
    })
  ).map(filterUserForClient);

  return comments.map((comment) => {
    const author = users.find((user) => user.id === comment.authorId);
    return {
      comment,
      author: {
        ...author,
        username: author?.username ?? "(username not found)",
        profileImageUrl: author?.profileImageUrl ?? "(profile image not found)",
      },
    };
  });
};

export const commentsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const comments = await ctx.prisma.comment.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }],
    });

    return comments;
  }),
  getCommentsByAlbumId: publicProcedure
    .input(
      z.object({
        albumId: z.string()
      }))
    .query(async ({ ctx, input }) => {
      const comments = await ctx.prisma.comment.findMany({
        where: {
          albumId: input.albumId,
        },
        take: 100,
        orderBy: [{ createdAt: "desc" }],
      });

      return addUserDataToComments(comments);
    }),
  create: privateProcedure
    .input(
      z.object({
        albumId: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const comment = await ctx.prisma.comment.create({
        data: {
          authorId,
          albumId: input.albumId,
          content: input.content,
        },
      });

      return comment;
    }),

});

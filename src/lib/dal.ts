import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect("/login");
  }

  return { isAuth: true, userId: session.userId as string };
});

export const getUser = cache(async () => {
  const session = await verifySession();
  if (!session) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, email: true },
    });
    return user;
  } catch {
    return null;
  }
});

/**
 * A user can access a board if they own it or are a member of it.
 * Returns the role ("owner" | "member") or null if they have no access.
 */
export async function getBoardRole(boardId: string, userId: string) {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: {
      ownerId: true,
      members: { where: { userId }, select: { role: true } },
    },
  });

  if (!board) return null;
  if (board.ownerId === userId) return "owner" as const;
  if (board.members.length > 0) return "member" as const;
  return null;
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession, getBoardRole } from "@/lib/dal";
import { logActivity } from "@/lib/activity";

export async function createBoard(formData: FormData) {
  const session = await verifySession();
  const title = formData.get("title") as string;

  if (!title || title.trim().length === 0) {
    return;
  }

  const board = await prisma.board.create({
    data: { title: title.trim(), ownerId: session.userId },
  });

  redirect(`/board/${board.id}`);
}

export async function deleteBoard(boardId: string) {
  const session = await verifySession();

  // Only the owner can delete a board, never a member.
  await prisma.board.deleteMany({
    where: { id: boardId, ownerId: session.userId },
  });

  revalidatePath("/dashboard");
}

export async function updateBoardColor(boardId: string, color: string) {
  const session = await verifySession();
  const role = await getBoardRole(boardId, session.userId);
  if (!role) return;

  await prisma.board.update({
    where: { id: boardId },
    data: { color },
  });

  revalidatePath(`/board/${boardId}`);
}

export async function inviteMember(boardId: string, formData: FormData) {
  const session = await verifySession();
  const role = await getBoardRole(boardId, session.userId);
  if (role !== "owner") return { error: "Only the board owner can invite members." };

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email) return { error: "Enter an email address." };

  const invitedUser = await prisma.user.findUnique({ where: { email } });
  if (!invitedUser) {
    return { error: "No account found with that email. They need to sign up first." };
  }

  const board = await prisma.board.findUnique({ where: { id: boardId }, select: { ownerId: true } });
  if (board?.ownerId === invitedUser.id) {
    return { error: "That user already owns this board." };
  }

  await prisma.boardMember.upsert({
    where: { boardId_userId: { boardId, userId: invitedUser.id } },
    create: { boardId, userId: invitedUser.id },
    update: {},
  });

  await logActivity(boardId, session.userId, `invited ${invitedUser.name} to the board`);

  revalidatePath(`/board/${boardId}`);
  return { success: `${invitedUser.name} was added to the board.` };
}

export async function removeMember(boardId: string, memberUserId: string) {
  const session = await verifySession();
  const role = await getBoardRole(boardId, session.userId);
  if (role !== "owner") return;

  await prisma.boardMember.deleteMany({ where: { boardId, userId: memberUserId } });
  revalidatePath(`/board/${boardId}`);
}

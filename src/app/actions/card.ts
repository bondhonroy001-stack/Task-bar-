"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession, getBoardRole } from "@/lib/dal";
import { logActivity } from "@/lib/activity";

export async function createCard(boardId: string, listId: string, formData: FormData) {
  const session = await verifySession();
  const role = await getBoardRole(boardId, session.userId);
  if (!role) return;

  const title = formData.get("title") as string;
  if (!title || title.trim().length === 0) return;

  const count = await prisma.card.count({ where: { listId } });

  await prisma.card.create({
    data: { title: title.trim(), listId, order: count },
  });

  await logActivity(boardId, session.userId, `added card "${title.trim()}"`);
  revalidatePath(`/board/${boardId}`);
}

export async function deleteCard(boardId: string, cardId: string) {
  const session = await verifySession();
  const role = await getBoardRole(boardId, session.userId);
  if (!role) return;

  await prisma.card.delete({ where: { id: cardId } });
  revalidatePath(`/board/${boardId}`);
}

export async function updateCard(boardId: string, cardId: string, formData: FormData) {
  const session = await verifySession();
  const role = await getBoardRole(boardId, session.userId);
  if (!role) return;

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const dueDateRaw = formData.get("dueDate") as string;
  const labels = formData.getAll("labels") as string[];

  if (!title || title.trim().length === 0) return;

  await prisma.card.update({
    where: { id: cardId },
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      labels,
    },
  });

  revalidatePath(`/board/${boardId}`);
}

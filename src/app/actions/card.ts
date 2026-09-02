"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

export async function createCard(boardId: string, listId: string, formData: FormData) {
  await verifySession();
  const title = formData.get("title") as string;
  if (!title || title.trim().length === 0) return;

  const count = await prisma.card.count({ where: { listId } });

  await prisma.card.create({
    data: { title: title.trim(), listId, order: count },
  });

  revalidatePath(`/board/${boardId}`);
}

export async function deleteCard(boardId: string, cardId: string) {
  await verifySession();
  await prisma.card.delete({ where: { id: cardId } });
  revalidatePath(`/board/${boardId}`);
}

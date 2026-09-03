"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession, getBoardRole } from "@/lib/dal";
import { logActivity } from "@/lib/activity";

export async function createList(boardId: string, formData: FormData) {
  const session = await verifySession();
  const role = await getBoardRole(boardId, session.userId);
  if (!role) return;

  const title = formData.get("title") as string;
  if (!title || title.trim().length === 0) return;

  const count = await prisma.list.count({ where: { boardId } });

  await prisma.list.create({
    data: { title: title.trim(), boardId, order: count },
  });

  await logActivity(boardId, session.userId, `added list "${title.trim()}"`);
  revalidatePath(`/board/${boardId}`);
}

export async function deleteList(boardId: string, listId: string) {
  const session = await verifySession();
  const role = await getBoardRole(boardId, session.userId);
  if (!role) return;

  await prisma.list.delete({ where: { id: listId } });
  revalidatePath(`/board/${boardId}`);
}

export async function reorderCard(
  boardId: string,
  cardId: string,
  targetListId: string,
  targetIndex: number
) {
  const session = await verifySession();
  const role = await getBoardRole(boardId, session.userId);
  if (!role) return;

  const cardsInTargetList = await prisma.card.findMany({
    where: { listId: targetListId, NOT: { id: cardId } },
    orderBy: { order: "asc" },
  });

  cardsInTargetList.splice(targetIndex, 0, { id: cardId } as (typeof cardsInTargetList)[number]);

  await prisma.$transaction(
    cardsInTargetList.map((card, index) =>
      prisma.card.update({
        where: { id: card.id },
        data: { order: index, listId: targetListId },
      })
    )
  );

  revalidatePath(`/board/${boardId}`);
}

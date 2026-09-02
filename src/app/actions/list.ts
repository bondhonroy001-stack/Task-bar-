"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

export async function createList(boardId: string, formData: FormData) {
  await verifySession();
  const title = formData.get("title") as string;
  if (!title || title.trim().length === 0) return;

  const count = await prisma.list.count({ where: { boardId } });

  await prisma.list.create({
    data: { title: title.trim(), boardId, order: count },
  });

  revalidatePath(`/board/${boardId}`);
}

export async function deleteList(boardId: string, listId: string) {
  await verifySession();
  await prisma.list.delete({ where: { id: listId } });
  revalidatePath(`/board/${boardId}`);
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

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

  await prisma.board.deleteMany({
    where: { id: boardId, ownerId: session.userId },
  });

  revalidatePath("/dashboard");
}

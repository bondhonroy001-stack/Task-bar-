import "server-only";
import { prisma } from "@/lib/prisma";

export async function logActivity(boardId: string, userId: string, message: string) {
  await prisma.activity.create({
    data: { boardId, userId, message },
  });
}

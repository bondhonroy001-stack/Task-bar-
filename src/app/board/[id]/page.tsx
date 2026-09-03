import Link from "next/link";
import { notFound } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { verifySession, getBoardRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import ThemeToggle from "@/components/ThemeToggle";
import BoardBoard from "@/app/board/[id]/BoardBoard";
import { BOARD_COLOR_ACCENT } from "@/lib/labels";

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await verifySession();

  const role = await getBoardRole(id, session.userId);
  if (!role) notFound();

  const board = await prisma.board.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      lists: {
        orderBy: { order: "asc" },
        include: { cards: { orderBy: { order: "asc" } } },
      },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!board) notFound();

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950">
      <header
        className={`border-b border-t-4 border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${BOARD_COLOR_ACCENT[board.color] ?? BOARD_COLOR_ACCENT.zinc}`}
      >
        <div className="flex items-center gap-4 px-6 py-4">
          <Link href="/dashboard" className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            ← Boards
          </Link>
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
          <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{board.title}</h1>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {board.lists.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-24 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
            <LayoutGrid size={20} />
          </div>
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">This board is empty. Add your first list below.</p>
        </div>
      ) : null}

      <BoardBoard
        boardId={board.id}
        color={board.color}
        initialLists={board.lists}
        isOwner={role === "owner"}
        owner={board.owner}
        members={board.members}
        activities={board.activities}
      />
    </div>
  );
}

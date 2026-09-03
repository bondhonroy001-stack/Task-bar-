import Link from "next/link";
import { LayoutGrid, Plus, Users } from "lucide-react";
import { getUser, verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { logout } from "@/app/actions/auth";
import { createBoard, deleteBoard } from "@/app/actions/board";
import ThemeToggle from "@/components/ThemeToggle";
import { BOARD_COLOR_SWATCH } from "@/lib/labels";

export default async function DashboardPage() {
  const user = await getUser();
  const session = await verifySession();

  const ownedBoards = await prisma.board.findMany({
    where: { ownerId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      lists: { select: { _count: { select: { cards: true } } } },
    },
  });

  const sharedBoards = await prisma.board.findMany({
    where: { members: { some: { userId: session.userId } } },
    orderBy: { createdAt: "desc" },
    include: {
      lists: { select: { _count: { select: { cards: true } } } },
      owner: { select: { name: true } },
    },
  });

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
              T
            </div>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Task Board</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-sm text-zinc-500 dark:text-zinc-400">{user?.name}</span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Your boards</h1>
        </div>

        <form action={createBoard} className="mb-8 flex gap-2">
          <input
            name="title"
            placeholder="New board title"
            required
            className="w-72 rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            <Plus size={15} />
            Create board
          </button>
        </form>

        {ownedBoards.length === 0 && sharedBoards.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-zinc-300 bg-white/50 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
              <LayoutGrid size={18} />
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">You don&apos;t have any boards yet.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {ownedBoards.map((board, index) => {
                const cardCount = board.lists.reduce((sum, l) => sum + l._count.cards, 0);
                return (
                  <div
                    key={board.id}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className="animate-fade-slide-up group rounded-xl border border-t-4 border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                    data-color={board.color}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${BOARD_COLOR_SWATCH[board.color] ?? BOARD_COLOR_SWATCH.zinc}`} />
                        <Link href={`/board/${board.id}`} className="font-medium text-zinc-900 hover:underline dark:text-zinc-100">
                          {board.title}
                        </Link>
                      </div>
                      <form action={deleteBoard.bind(null, board.id)}>
                        <button
                          type="submit"
                          className="text-xs text-zinc-400 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                    <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                      {board.lists.length} {board.lists.length === 1 ? "list" : "lists"} · {cardCount}{" "}
                      {cardCount === 1 ? "card" : "cards"}
                    </p>
                  </div>
                );
              })}
            </div>

            {sharedBoards.length > 0 && (
              <>
                <h2 className="mb-4 mt-10 text-sm font-semibold text-zinc-500 dark:text-zinc-400">Shared with you</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {sharedBoards.map((board) => {
                    const cardCount = board.lists.reduce((sum, l) => sum + l._count.cards, 0);
                    return (
                      <div
                        key={board.id}
                        className="rounded-xl border border-t-4 border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${BOARD_COLOR_SWATCH[board.color] ?? BOARD_COLOR_SWATCH.zinc}`} />
                          <Link href={`/board/${board.id}`} className="font-medium text-zinc-900 hover:underline dark:text-zinc-100">
                            {board.title}
                          </Link>
                        </div>
                        <p className="mt-2 flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
                          <Users size={11} />
                          {board.owner.name}&apos;s board · {cardCount} {cardCount === 1 ? "card" : "cards"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

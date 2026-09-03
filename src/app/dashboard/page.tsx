import Link from "next/link";
import { getUser, verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { logout } from "@/app/actions/auth";
import { createBoard, deleteBoard } from "@/app/actions/board";

export default async function DashboardPage() {
  const user = await getUser();
  const session = await verifySession();

  const boards = await prisma.board.findMany({
    where: { ownerId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-xs font-semibold text-white">
              T
            </div>
            <span className="text-sm font-semibold text-zinc-900">Task Board</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500">{user?.name}</span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-zinc-900">Your boards</h1>
        </div>

        <form action={createBoard} className="mb-8 flex gap-2">
          <input
            name="title"
            placeholder="New board title"
            required
            className="w-72 rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5"
          />
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Create board
          </button>
        </form>

        {boards.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white/50 py-16 text-center">
            <p className="text-sm text-zinc-500">You don&apos;t have any boards yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {boards.map((board) => (
              <div
                key={board.id}
                className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <Link href={`/board/${board.id}`} className="font-medium text-zinc-900 hover:underline">
                    {board.title}
                  </Link>
                  <form action={deleteBoard.bind(null, board.id)}>
                    <button
                      type="submit"
                      className="text-xs text-zinc-400 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

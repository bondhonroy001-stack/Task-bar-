import Link from "next/link";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { createList, deleteList } from "@/app/actions/list";
import { createCard, deleteCard } from "@/app/actions/card";

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await verifySession();

  const board = await prisma.board.findFirst({
    where: { id, ownerId: session.userId },
    include: {
      lists: {
        orderBy: { order: "asc" },
        include: { cards: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!board) notFound();

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-none items-center gap-4 px-6 py-4">
          <Link href="/dashboard" className="text-sm text-zinc-500 transition-colors hover:text-zinc-900">
            ← Boards
          </Link>
          <div className="h-4 w-px bg-zinc-200" />
          <h1 className="text-base font-semibold text-zinc-900">{board.title}</h1>
        </div>
      </header>

      <main className="flex gap-5 overflow-x-auto px-6 py-8">
        {board.lists.map((list) => (
          <div key={list.id} className="w-72 shrink-0 rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-800">{list.title}</h2>
              <form action={deleteList.bind(null, board.id, list.id)}>
                <button type="submit" className="text-xs text-zinc-400 transition-colors hover:text-red-600">
                  Delete
                </button>
              </form>
            </div>

            <div className="space-y-2">
              {list.cards.map((card) => (
                <div
                  key={card.id}
                  className="group flex items-start justify-between rounded-lg border border-zinc-100 bg-zinc-50 p-2.5 text-sm text-zinc-800 transition-colors hover:border-zinc-200"
                >
                  <span>{card.title}</span>
                  <form action={deleteCard.bind(null, board.id, card.id)}>
                    <button
                      type="submit"
                      className="ml-2 text-zinc-300 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
                      aria-label="Delete card"
                    >
                      ×
                    </button>
                  </form>
                </div>
              ))}
            </div>

            <form action={createCard.bind(null, board.id, list.id)} className="mt-3 flex gap-1.5">
              <input
                name="title"
                placeholder="Add a card"
                required
                className="w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm outline-none transition-colors focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800"
              >
                Add
              </button>
            </form>
          </div>
        ))}

        <form action={createList.bind(null, board.id)} className="w-72 shrink-0">
          <div className="rounded-xl border border-dashed border-zinc-300 p-3.5">
            <input
              name="title"
              placeholder="Add a list"
              required
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5"
            />
            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-zinc-900 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Add list
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

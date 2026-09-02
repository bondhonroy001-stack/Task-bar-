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
    <div className="min-h-screen bg-gray-50 p-8">
      <Link href="/dashboard" className="text-sm text-gray-600 hover:underline">
        ← Back to boards
      </Link>
      <h1 className="mt-2 text-xl font-semibold text-gray-900">{board.title}</h1>

      <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
        {board.lists.map((list) => (
          <div key={list.id} className="w-64 shrink-0 rounded-lg bg-gray-100 p-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">{list.title}</h2>
              <form action={deleteList.bind(null, board.id, list.id)}>
                <button type="submit" className="text-xs text-red-600 hover:underline">
                  Delete
                </button>
              </form>
            </div>

            <div className="mt-3 space-y-2">
              {list.cards.map((card) => (
                <div key={card.id} className="flex items-start justify-between rounded-md bg-white p-2 text-sm shadow-sm">
                  <span>{card.title}</span>
                  <form action={deleteCard.bind(null, board.id, card.id)}>
                    <button type="submit" className="ml-2 text-xs text-red-600 hover:underline">
                      ×
                    </button>
                  </form>
                </div>
              ))}
            </div>

            <form action={createCard.bind(null, board.id, list.id)} className="mt-3 flex gap-1">
              <input
                name="title"
                placeholder="Add a card"
                required
                className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
              />
              <button type="submit" className="rounded-md bg-gray-900 px-2 py-1 text-xs text-white">
                Add
              </button>
            </form>
          </div>
        ))}

        <form action={createList.bind(null, board.id)} className="w-64 shrink-0">
          <input
            name="title"
            placeholder="Add a list"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <button type="submit" className="mt-2 w-full rounded-md bg-gray-900 py-1.5 text-sm text-white">
            Add list
          </button>
        </form>
      </div>
    </div>
  );
}

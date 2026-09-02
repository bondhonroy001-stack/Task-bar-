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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Welcome, {user?.name}</h1>
        <form action={logout}>
          <button type="submit" className="rounded-md border px-3 py-1.5 text-sm text-gray-700">
            Log out
          </button>
        </form>
      </div>

      <form action={createBoard} className="mt-8 flex gap-2">
        <input
          name="title"
          placeholder="New board title"
          required
          className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white">
          Create board
        </button>
      </form>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {boards.map((board) => (
          <div key={board.id} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <Link href={`/board/${board.id}`} className="font-medium text-gray-900 hover:underline">
                {board.title}
              </Link>
              <form action={deleteBoard.bind(null, board.id)}>
                <button type="submit" className="text-sm text-red-600 hover:underline">
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      {boards.length === 0 && <p className="mt-4 text-sm text-gray-500">You don&apos;t have any boards yet.</p>}
    </div>
  );
}

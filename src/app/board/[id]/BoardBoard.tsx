"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Search, Users, History, Palette, UserMinus } from "lucide-react";
import { createList, deleteList, reorderCard } from "@/app/actions/list";
import { createCard } from "@/app/actions/card";
import { updateBoardColor, inviteMember, removeMember } from "@/app/actions/board";
import CardModal from "@/app/board/[id]/CardModal";
import { labelClass, BOARD_COLOR_SWATCH } from "@/lib/labels";

type CardData = {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  labels: string[];
};

type ListData = {
  id: string;
  title: string;
  cards: CardData[];
};

type MemberData = {
  userId: string;
  role: string;
  user: { id: string; name: string; email: string };
};

type ActivityData = {
  id: string;
  message: string;
  createdAt: Date;
  user: { name: string };
};

export default function BoardBoard({
  boardId,
  color,
  initialLists,
  isOwner,
  owner,
  members,
  activities,
}: {
  boardId: string;
  color: string;
  initialLists: ListData[];
  isOwner: boolean;
  owner: { id: string; name: string };
  members: MemberData[];
  activities: ActivityData[];
}) {
  const [lists, setLists] = useState(initialLists);
  const [search, setSearch] = useState("");
  const [panel, setPanel] = useState<"none" | "members" | "activity" | "color">("none");
  const [activeCard, setActiveCard] = useState<CardData | null>(null);

  useEffect(() => setLists(initialLists), [initialLists]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function findContainer(id: string) {
    if (lists.some((l) => l.id === id)) return id;
    return lists.find((l) => l.cards.some((c) => c.id === id))?.id;
  }

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as string;
    for (const list of lists) {
      const card = list.cards.find((c) => c.id === id);
      if (card) {
        setActiveCard(card);
        return;
      }
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const sourceListId = findContainer(activeId);
    const targetListId = findContainer(overId);
    if (!sourceListId || !targetListId) return;

    const next = lists.map((l) => ({ ...l, cards: [...l.cards] }));
    const source = next.find((l) => l.id === sourceListId)!;
    const target = next.find((l) => l.id === targetListId)!;
    const cardIndex = source.cards.findIndex((c) => c.id === activeId);
    const [movedCard] = source.cards.splice(cardIndex, 1);

    let targetIndex = target.cards.findIndex((c) => c.id === overId);
    if (targetIndex === -1) targetIndex = target.cards.length;

    target.cards.splice(targetIndex, 0, movedCard);

    setLists(next);
    reorderCard(boardId, activeId, targetListId, targetIndex);
  }

  const filteredLists = useMemo(() => {
    if (!search.trim()) return lists;
    const q = search.toLowerCase();
    return lists.map((l) => ({ ...l, cards: l.cards.filter((c) => c.title.toLowerCase().includes(q)) }));
  }, [lists, search]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cards..."
            className="w-52 rounded-lg border border-zinc-200 bg-white py-1.5 pl-8 pr-3 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setPanel(panel === "color" ? "none" : "color")}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Palette size={13} />
            Color
          </button>
          <button
            onClick={() => setPanel(panel === "members" ? "none" : "members")}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Users size={13} />
            {members.length + 1}
          </button>
          <button
            onClick={() => setPanel(panel === "activity" ? "none" : "activity")}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <History size={13} />
            Activity
          </button>
        </div>
      </div>

      {panel === "color" && (
        <div className="flex items-center gap-2 border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Board color:</span>
          {Object.entries(BOARD_COLOR_SWATCH).map(([name, cls]) => (
            <button
              key={name}
              onClick={() => updateBoardColor(boardId, name)}
              className={`h-6 w-6 rounded-full ${cls} ${color === name ? "ring-2 ring-offset-2 ring-zinc-400 dark:ring-offset-zinc-900" : ""}`}
              aria-label={name}
            />
          ))}
        </div>
      )}

      {panel === "members" && (
        <div className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 space-y-1.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-zinc-700 dark:text-zinc-200">{owner.name} (owner)</span>
            </div>
            {members.map((m) => (
              <div key={m.userId} className="flex items-center justify-between">
                <span className="text-zinc-700 dark:text-zinc-200">{m.user.name}</span>
                {isOwner && (
                  <button
                    onClick={() => removeMember(boardId, m.userId)}
                    className="text-zinc-400 hover:text-red-500"
                    aria-label="Remove member"
                  >
                    <UserMinus size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {isOwner && (
            <form
              action={async (formData) => {
                const result = await inviteMember(boardId, formData);
                if (result?.error) alert(result.error);
              }}
              className="flex gap-2"
            >
              <input
                name="email"
                type="email"
                placeholder="Invite by email"
                required
                className="w-56 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
              <button
                type="submit"
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
              >
                Invite
              </button>
            </form>
          )}
        </div>
      )}

      {panel === "activity" && (
        <div className="max-h-56 overflow-y-auto border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          {activities.length === 0 ? (
            <p className="text-sm text-zinc-400">No activity yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {activities.map((a) => (
                <li key={a.id} className="text-zinc-600 dark:text-zinc-300">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{a.user.name}</span> {a.message}
                  <span className="ml-2 text-xs text-zinc-400">
                    {new Date(a.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <main className="flex gap-5 overflow-x-auto px-6 py-8">
          {filteredLists.map((list, index) => (
            <ListColumn key={list.id} boardId={boardId} list={list} index={index} />
          ))}

          <form
            action={createList.bind(null, boardId)}
            style={{ animationDelay: `${lists.length * 60}ms` }}
            className="animate-fade-slide-up w-72 shrink-0"
          >
            <div className="rounded-xl border border-dashed border-zinc-300 p-3.5 dark:border-zinc-700">
              <input
                name="title"
                placeholder="Add a list"
                required
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
              <button
                type="submit"
                className="mt-2 w-full rounded-lg bg-zinc-900 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                Add list
              </button>
            </div>
          </form>
        </main>

        <DragOverlay>
          {activeCard && (
            <div className="w-72 rounded-lg border border-zinc-200 bg-white p-2.5 text-sm shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
              {activeCard.labels.length > 0 && (
                <div className="mb-1 flex flex-wrap gap-1">
                  {activeCard.labels.map((label) => (
                    <span key={label} className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${labelClass(label)}`}>
                      {label}
                    </span>
                  ))}
                </div>
              )}
              {activeCard.title}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function ListColumn({ boardId, list, index }: { boardId: string; list: ListData; index: number }) {
  const { setNodeRef } = useDroppable({ id: list.id });

  return (
    <div
      style={{ animationDelay: `${index * 60}ms` }}
      className="animate-fade-slide-up w-72 shrink-0 rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{list.title}</h2>
          <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {list.cards.length}
          </span>
        </div>
        <form action={deleteList.bind(null, boardId, list.id)}>
          <button type="submit" className="text-xs text-zinc-400 transition-colors hover:text-red-600">
            Delete
          </button>
        </form>
      </div>

      <div ref={setNodeRef} className="min-h-[8px] space-y-2">
        <SortableContext items={list.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {list.cards.map((card) => (
            <SortableCardItem key={card.id} boardId={boardId} card={card} />
          ))}
        </SortableContext>
      </div>

      <form action={createCard.bind(null, boardId, list.id)} className="mt-3 flex gap-1.5">
        <input
          name="title"
          placeholder="Add a card"
          required
          className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Add
        </button>
      </form>
    </div>
  );
}

function SortableCardItem({ boardId, card }: { boardId: string; card: CardData }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} suppressHydrationWarning {...attributes} {...listeners}>
      <CardModal boardId={boardId} card={card} />
    </div>
  );
}

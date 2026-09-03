"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Trash2, Calendar, AlignLeft } from "lucide-react";
import { updateCard, deleteCard } from "@/app/actions/card";
import { LABELS, labelClass } from "@/lib/labels";

type CardData = {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  labels: string[];
};

export default function CardModal({ boardId, card }: { boardId: string; card: CardData }) {
  const [open, setOpen] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>(card.labels);

  const dueDateValue = card.dueDate ? new Date(card.dueDate).toISOString().slice(0, 10) : "";
  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date(new Date().toDateString());

  function toggleLabel(name: string) {
    setSelectedLabels((prev) => (prev.includes(name) ? prev.filter((l) => l !== name) : [...prev, name]));
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group flex w-full flex-col items-start gap-1.5 rounded-lg border border-zinc-100 bg-zinc-50 p-2.5 text-left text-sm text-zinc-800 transition-colors hover:border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-700"
      >
        {card.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {card.labels.map((label) => (
              <span key={label} className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${labelClass(label)}`}>
                {label}
              </span>
            ))}
          </div>
        )}
        <span>{card.title}</span>
        {(card.description || card.dueDate) && (
          <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
            {card.description && <AlignLeft size={12} />}
            {card.dueDate && (
              <span
                className={`flex items-center gap-1 rounded px-1.5 py-0.5 ${
                  isOverdue
                    ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                <Calendar size={11} />
                {new Date(card.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </span>
            )}
          </div>
        )}
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
                onClick={() => setOpen(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 8 }}
                  transition={{ duration: 0.15 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <h3 className="text-sm font-semibold text-zinc-400 dark:text-zinc-500">Edit card</h3>
                    <button
                      onClick={() => setOpen(false)}
                      className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <form
                    action={async (formData) => {
                      selectedLabels.forEach((label) => formData.append("labels", label));
                      await updateCard(boardId, card.id, formData);
                      setOpen(false);
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        Title
                      </label>
                      <input
                        name="title"
                        defaultValue={card.title}
                        required
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-zinc-100/5"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        Labels
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {LABELS.map((label) => {
                          const active = selectedLabels.includes(label.name);
                          return (
                            <button
                              key={label.name}
                              type="button"
                              onClick={() => toggleLabel(label.name)}
                              className={`rounded px-2 py-1 text-xs font-medium transition-opacity ${label.className} ${
                                active ? "opacity-100 ring-2 ring-offset-1 ring-zinc-400 dark:ring-offset-zinc-900" : "opacity-40"
                              }`}
                            >
                              {label.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        Description
                      </label>
                      <textarea
                        name="description"
                        defaultValue={card.description ?? ""}
                        rows={3}
                        placeholder="Add more detail..."
                        className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-zinc-100/5"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        Due date
                      </label>
                      <input
                        type="date"
                        name="dueDate"
                        defaultValue={dueDateValue}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:[color-scheme:dark]"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteCard(boardId, card.id);
                          setOpen(false);
                        }}
                        className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                        Delete card
                      </button>
                      <button
                        type="submit"
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

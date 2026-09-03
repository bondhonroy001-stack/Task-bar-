export const LABELS = [
  { name: "Bug", className: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400" },
  { name: "Feature", className: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400" },
  { name: "Urgent", className: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400" },
  { name: "Idea", className: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400" },
  { name: "Done", className: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400" },
] as const;

export function labelClass(name: string) {
  return LABELS.find((l) => l.name === name)?.className ?? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";
}

export const BOARD_COLOR_SWATCH: Record<string, string> = {
  zinc: "bg-zinc-900 dark:bg-zinc-100",
  blue: "bg-blue-600",
  purple: "bg-purple-600",
  green: "bg-emerald-600",
  rose: "bg-rose-600",
};

export const BOARD_COLOR_ACCENT: Record<string, string> = {
  zinc: "border-t-zinc-900 dark:border-t-zinc-100",
  blue: "border-t-blue-600",
  purple: "border-t-purple-600",
  green: "border-t-emerald-600",
  rose: "border-t-rose-600",
};

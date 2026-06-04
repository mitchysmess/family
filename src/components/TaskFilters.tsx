import type { TaskFilter } from "@/types/task";
import { cn } from "@/lib/utils";

const taskFilters: { label: string; value: TaskFilter }[] = [
  { label: "Alle taken", value: "alle" },
  { label: "Open", value: "open" },
  { label: "Afgerond", value: "done" },
];

type TaskFiltersProps = {
  activeFilter: TaskFilter;
  onChange: (filter: TaskFilter) => void;
};

export function TaskFilters({ activeFilter, onChange }: TaskFiltersProps) {
  return (
    <div
      className="flex w-full max-w-full flex-nowrap gap-1 overflow-x-auto rounded-3xl border border-[#b9cdb7] bg-[#fff2b8]/30 p-1 sm:inline-flex sm:w-auto sm:rounded-full"
      aria-label="Taken filteren"
    >
      {taskFilters.map((filter) => (
        <button
          key={filter.value}
          type="button"
          onClick={() => onChange(filter.value)}
          className={cn(
            "h-9 shrink-0 flex-1 rounded-full px-3 text-sm font-semibold transition sm:flex-none",
            activeFilter === filter.value
              ? "bg-[#244f45] text-[#fff2b8] shadow-sm"
              : "text-[#347468] hover:bg-white hover:text-[#e66d35]",
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

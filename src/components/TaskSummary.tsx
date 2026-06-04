import { CheckCircle2, Circle, ClipboardList } from "lucide-react";
import { Card } from "@/components/ui/card";

type TaskSummaryProps = {
  totalTasks: number;
  openTasks: number;
  completedTasks: number;
};

export function TaskSummary({
  totalTasks,
  openTasks,
  completedTasks,
}: TaskSummaryProps) {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      <SummaryItem label="Totaal" value={totalTasks} icon={ClipboardList} />
      <SummaryItem label="Open" value={openTasks} icon={Circle} />
      <SummaryItem label="Afgerond" value={completedTasks} icon={CheckCircle2} />
    </div>
  );
}

function SummaryItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof ClipboardList;
}) {
  return (
    <Card className="bg-[#fffdf7] px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          {label}
        </p>
        <Icon className="h-4 w-4 text-[#347468]" />
      </div>
      <p className="mt-2 text-2xl font-semibold text-neutral-950">{value}</p>
    </Card>
  );
}

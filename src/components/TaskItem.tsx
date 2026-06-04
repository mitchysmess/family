import { useState } from "react";
import { Flame, PencilLine, Save, Trash2, UserRound } from "lucide-react";
import type { Profile, Task } from "@/types/task";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TaskItemProps = {
  task: Task;
  assignee?: Profile;
  profiles: Profile[];
  isMine: boolean;
  onDelete: (taskId: string) => void;
  onAssign: (taskId: string, profileId: string) => void;
  onUpdateDescription: (taskId: string, description: string) => void;
  onTogglePriority: (taskId: string) => void;
};

export function TaskItem({
  task,
  assignee,
  profiles,
  isMine,
  onDelete,
  onAssign,
  onUpdateDescription,
  onTogglePriority,
}: TaskItemProps) {
  const isCompleted = task.status === "done";
  const isHighPriority = task.priority === "high";
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [isEditingAssignee, setIsEditingAssignee] = useState(false);
  const [note, setNote] = useState(task.description ?? "");

  function saveNote() {
    onUpdateDescription(task.id, note);
    setIsEditingNote(false);
  }

  return (
    <li
      className={cn(
        "grid gap-3 px-4 py-4 transition hover:bg-[#fffdf7] sm:grid-cols-[1fr_auto] sm:items-start sm:px-5",
        isMine ? "bg-[#fffaf0]" : "bg-white",
      )}
      style={
        assignee?.profileColor
          ? { borderLeft: `5px solid ${assignee.profileColor}` }
          : undefined
      }
    >
      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {isEditingAssignee ? (
            <select
              autoFocus
              value={task.assignedTo}
              onBlur={() => setIsEditingAssignee(false)}
              onChange={(event) => {
                onAssign(task.id, event.target.value);
                setIsEditingAssignee(false);
              }}
              className="h-9 max-w-full rounded-full border border-[#347468] bg-white px-3 text-sm font-semibold text-neutral-800 outline-none ring-2 ring-[#347468]/15"
            >
              <option value="">Niet toegewezen</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.fullName}
                </option>
              ))}
            </select>
          ) : (
            <AssigneeChip
              assignee={assignee}
              onClick={() => setIsEditingAssignee(true)}
            />
          )}
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
              isCompleted
                ? "bg-emerald-50 text-emerald-700"
                : "bg-[#fff2b8] text-[#7d8b38]",
            )}
          >
            {isCompleted ? "Afgerond" : "Open"}
          </span>
          {isHighPriority ? (
            <span
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#e66d35]/10 text-[#e66d35] ring-1 ring-[#e66d35]/20"
              aria-label="Prioriteit"
              title="Prioriteit"
            >
              <Flame className="h-3.5 w-3.5" />
            </span>
          ) : null}
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3
              className={cn(
                "text-base font-semibold leading-snug text-neutral-950 sm:text-lg",
                isCompleted && "text-neutral-500 line-through",
                !isCompleted && "text-[#183b35]",
              )}
            >
              {task.title}
            </h3>
            {!isEditingNote && task.description ? (
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-neutral-600">
                {task.description}
              </p>
            ) : null}
            {!isEditingNote && !task.description ? (
              <p className="mt-1 text-sm text-neutral-400">Geen notitie.</p>
            ) : null}
          </div>
          {!isEditingNote ? (
            <button
              type="button"
              onClick={() => setIsEditingNote(true)}
              aria-label="Notitie bewerken"
              title="Notitie bewerken"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#347468] hover:bg-[#f4fbf3] hover:text-[#244f45]"
            >
              <PencilLine className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {isEditingNote ? (
          <div className="rounded-2xl border border-[#d7e3ce] bg-[#f4fbf3] p-3">
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              placeholder="Bijv. boven schoongemaakt, beneden moet nog"
              className="w-full resize-none rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm leading-6 outline-none transition focus:border-[#347468] focus:ring-2 focus:ring-[#347468]/15"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={saveNote}
                aria-label="Notitie opslaan"
                title="Notitie opslaan"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#244f45] text-white hover:bg-[#347468]"
              >
                <Save className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-row gap-2 sm:flex-col sm:items-end">
        <Button
          variant={isHighPriority ? "secondary" : "outline"}
          size="icon"
          onClick={() => onTogglePriority(task.id)}
          aria-label={isHighPriority ? "Prioriteit verwijderen" : "Prioriteit geven"}
          title={isHighPriority ? "Prioriteit verwijderen" : "Prioriteit geven"}
          className={cn(
            "h-9 w-9",
            isHighPriority
              ? "border-[#e66d35] bg-[#e66d35] text-white shadow-[0_8px_20px_rgba(242,90,20,0.24)] hover:bg-[#e65012]"
              : "border-[#b9cdb7] text-[#9ab7d9] hover:border-[#e66d35]/70 hover:text-[#e66d35]",
          )}
        >
          <Flame className="h-4 w-4" />
        </Button>
        <Button
          variant="danger"
          size="icon"
          onClick={() => onDelete(task.id)}
          aria-label="Taak verwijderen"
          title="Taak verwijderen"
          className="h-9 w-9"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
}

function AssigneeChip({
  assignee,
  onClick,
}: {
  assignee?: Profile;
  onClick: () => void;
}) {
  if (!assignee) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex w-fit items-center gap-2 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#347468]/20"
        aria-label="Taak toewijzen"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-300">
          <UserRound className="h-3.5 w-3.5" />
        </span>
        Niet toegewezen
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f4fbf3] px-2.5 py-1 text-xs font-semibold text-[#347468] transition hover:bg-[#e9f5ea] focus:outline-none focus:ring-2 focus:ring-[#347468]/20"
      aria-label={`Toewijzing wijzigen: ${assignee.fullName}`}
    >
      <UserAvatar profile={assignee} size="sm" />
      {assignee.fullName}
    </button>
  );
}

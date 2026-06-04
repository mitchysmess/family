"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Flame,
  Sparkles,
  UserRound,
} from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import type { Profile, Task } from "@/types/task";

type TaskOverviewCardProps = {
  task: Task;
  profiles: Profile[];
  assignee?: Profile;
  onToggle: () => Promise<void>;
  onAssign: (profileId: string) => void;
  onTogglePriority: () => void;
};

const celebrationMessages = [
  "High five",
  "Lekker bezig",
  "Huispunt erbij",
  "Mooi meegenomen",
  "Rondje keuken-dans",
];

export function TaskOverviewCard({
  task,
  profiles,
  assignee,
  onToggle,
  onAssign,
  onTogglePriority,
}: TaskOverviewCardProps) {
  const isDone = task.status === "done";
  const isHighPriority = task.priority === "high";
  const waitingDays = getWaitingDays(task.createdAt);
  const waitingMessage =
    !isDone && waitingDays >= 3 ? getWaitingMessage(waitingDays) : undefined;
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState(
    celebrationMessages[0],
  );
  const [isEditingAssignee, setIsEditingAssignee] = useState(false);

  async function handleStatusClick() {
    if (isDone) {
      await onToggle();
      return;
    }

    setCelebrationMessage(getCelebrationMessage(task.id));
    setIsCelebrating(true);
    window.setTimeout(() => {
      void onToggle();
    }, 420);
    window.setTimeout(() => setIsCelebrating(false), 900);
  }

  return (
    <motion.article
      layout
      className={`group relative overflow-hidden rounded-3xl border bg-white/95 p-4 shadow-[0_14px_38px_rgba(36,79,69,0.08)] transition active:scale-[0.99] sm:p-5 ${
        isDone
          ? "border-[#d7e3ce] bg-[#fffdf7] text-[#8a6b60]"
          : isHighPriority
            ? "border-[#e66d35]/45 text-[#183b35] shadow-[0_16px_42px_rgba(242,90,20,0.12)]"
            : "border-[#d7e3ce] text-[#183b35] hover:border-[#b9cdb7] hover:shadow-md"
      }`}
      style={
        assignee?.profileColor
          ? { borderLeft: `5px solid ${assignee.profileColor}` }
        : undefined
      }
    >
      {isCelebrating ? (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.82, rotate: -8 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.82, 1, 1, 0.96] }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="pointer-events-none absolute bottom-3 left-4 z-10 flex items-center gap-2 rounded-full border-2 border-[#244f45] bg-[#fff2b8] px-3 py-2 text-[11px] font-black uppercase tracking-wide text-[#244f45] shadow-[0_12px_32px_rgba(36,79,69,0.16)]"
        >
          <CheckCircle2 className="h-4 w-4 text-[#e66d35]" />
          Afgevinkt
        </motion.div>
      ) : null}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 sm:gap-4">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {isEditingAssignee ? (
              <select
                autoFocus
                value={task.assignedTo}
                onBlur={() => setIsEditingAssignee(false)}
                onChange={(event) => {
                  onAssign(event.target.value);
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
            {isHighPriority ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#e66d35]/10 px-2.5 py-1 text-xs font-semibold text-[#e66d35] ring-1 ring-[#e66d35]/20">
                <Flame className="h-3.5 w-3.5" />
                Prioriteit
              </span>
            ) : null}
          </div>
          <h2
            className={`text-xl font-semibold leading-snug tracking-normal sm:text-lg ${
              isDone
                ? "text-[#8a6b60] line-through decoration-[#b9cdb7]"
                : "text-[#183b35]"
            }`}
          >
            {task.title}
          </h2>
          {task.description ? (
            <p className="text-base leading-7 text-[#5e6656] sm:text-sm sm:leading-6">
              {task.description}
            </p>
          ) : null}
          {waitingMessage ? (
            <div className="flex items-start gap-2 rounded-2xl border border-[#e66d35]/20 bg-[#fff2b8]/45 px-3 py-2 text-sm font-semibold leading-6 text-[#347468]">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#e66d35]" />
              <p>{waitingMessage}</p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onTogglePriority}
            aria-label="Prioriteit wijzigen"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition sm:h-11 sm:w-11 ${
              isHighPriority
                ? "border-[#e66d35] bg-[#e66d35] text-white shadow-[0_8px_22px_rgba(242,90,20,0.28)]"
                : "border-[#b9cdb7] bg-white text-[#9ab7d9] hover:border-[#e66d35]/60 hover:text-[#e66d35]"
            }`}
          >
            <Flame className="h-5 w-5" />
          </button>
          <motion.button
            type="button"
            onClick={handleStatusClick}
            aria-label={isDone ? "Zet taak weer open" : "Taak afvinken"}
            whileTap={{ scale: 0.88, rotate: isDone ? 0 : -8 }}
            animate={
              isCelebrating
                ? { scale: [1, 1.12, 0.98, 1], rotate: [0, -8, 8, 0] }
                : { scale: 1, rotate: 0 }
            }
            transition={{ duration: 0.45 }}
            className={`relative flex h-12 w-12 shrink-0 items-center justify-center overflow-visible rounded-full border-2 transition sm:h-14 sm:w-14 ${
              isDone
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-[#244f45] bg-[#244f45] text-[#fff2b8] shadow-md shadow-[#244f45]/20 hover:border-[#e66d35] hover:bg-[#347468]"
            }`}
          >
            {isCelebrating ? (
              <>
                <motion.span
                  initial={{ opacity: 0, y: 6, scale: 0.9 }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    y: [-2, -22, -28],
                    scale: [0.9, 1, 1],
                  }}
                  transition={{ duration: 0.7 }}
                  className="absolute -top-3 whitespace-nowrap rounded-full bg-[#e66d35] px-2 py-1 text-[11px] font-bold text-white shadow-sm"
                >
                  {celebrationMessage}
                </motion.span>
                <CelebrationSparkles />
                <Sparkles className="h-6 w-6" />
              </>
            ) : (
              <BadgeCheck className="h-7 w-7" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

function CelebrationSparkles() {
  const sparkles = [
    { x: -18, y: -20, delay: 0 },
    { x: 18, y: -18, delay: 0.04 },
    { x: -22, y: 10, delay: 0.08 },
    { x: 22, y: 12, delay: 0.12 },
    { x: 0, y: -30, delay: 0.16 },
  ];

  return (
    <>
      {sparkles.map((sparkle) => (
        <motion.span
          key={`${sparkle.x}-${sparkle.y}`}
          aria-hidden="true"
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
          animate={{
            opacity: [0, 1, 0],
            x: sparkle.x,
            y: sparkle.y,
            scale: [0.4, 1, 0.8],
          }}
          transition={{ delay: sparkle.delay, duration: 0.55 }}
          className="absolute h-1.5 w-1.5 rounded-full bg-[#e66d35] shadow-[0_0_0_4px_rgba(242,90,20,0.12)]"
        />
      ))}
    </>
  );
}

function getCelebrationMessage(taskId: string) {
  const charCodeTotal = Array.from(taskId).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );

  return celebrationMessages[charCodeTotal % celebrationMessages.length];
}

function getWaitingDays(createdAt: string) {
  const createdDate = new Date(createdAt);

  if (Number.isNaN(createdDate.getTime())) {
    return 0;
  }

  const today = new Date();
  const createdDay = Date.UTC(
    createdDate.getFullYear(),
    createdDate.getMonth(),
    createdDate.getDate(),
  );
  const currentDay = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const days = Math.floor((currentDay - createdDay) / 86_400_000);

  return Math.max(0, days);
}

function getWaitingMessage(days: number) {
  if (days === 3) {
    return "Deze taak wacht al 3 dagen. Tijd voor een klein doorpakmoment.";
  }

  if (days === 4) {
    return "Deze taak wacht al 4 dagen. Ze verdient inmiddels een vaste plek op tafel.";
  }

  if (days < 7) {
    return `Deze taak wacht al ${days} dagen. Kleine stap, groot rust-effect.`;
  }

  return `Deze taak wacht al ${days} dagen. Vandaag krijgt ze voorrang.`;
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

"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ChevronDown,
  Plus,
  RefreshCw,
  UsersRound,
} from "lucide-react";
import { LoginForm } from "@/components/LoginForm";
import { NewTaskModal } from "@/components/NewTaskModal";
import { TaskOverviewCard } from "@/components/TaskOverviewCard";
import { UserAvatar } from "@/components/UserAvatar";
import { getProfiles } from "@/lib/profiles";
import {
  createTask,
  getTasks,
  updateTaskAssignee,
  updateTaskPriority,
  updateTaskStatus,
} from "@/lib/tasks";
import type { NewTaskForm, Profile, Task, TaskFormErrors } from "@/types/task";

type AssigneeFilter = "all" | "unassigned" | string;

const today = new Date().toISOString().slice(0, 10);

const emptyForm = (assignedTo = ""): NewTaskForm => ({
  title: "",
  description: "",
  taskDate: today,
  assignedTo,
  repeat: "none",
  repeatUntil: "",
});

export function DailyOverviewShell() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<NewTaskForm>(() => emptyForm());
  const [formErrors, setFormErrors] = useState<TaskFormErrors>({});
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [areDoneTasksExpanded, setAreDoneTasksExpanded] = useState(false);
  const [hasLoadedDoneTasks, setHasLoadedDoneTasks] = useState(false);
  const [isLoadingDoneTasks, setIsLoadingDoneTasks] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeAssigneeFilter, setActiveAssigneeFilter] =
    useState<AssigneeFilter>("all");
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    async function loadPage() {
      try {
        const response = await fetch("/api/auth/session");
        const body = await response.json();
        const authenticated = Boolean(body.authenticated);

        setIsAuthenticated(authenticated);

        if (authenticated) {
          const [nextProfiles, nextTasks] = await Promise.all([
            getProfiles(),
            getTasks({ status: "open" }),
          ]);

          setProfiles(nextProfiles);
          setTasks(nextTasks);
        }
      } catch (pageError) {
        setError(getErrorMessage(pageError));
      } finally {
        setIsLoading(false);
      }
    }

    loadPage();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || isLoading) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setError(undefined);

      try {
        const query = searchQuery.trim();

        if (query) {
          setTasks(await getTasks({ searchQuery: query }));
          return;
        }

        if (areDoneTasksExpanded) {
          setIsLoadingDoneTasks(true);
        }

        const [openTasksFromServer, doneTasksFromServer] = await Promise.all([
          getTasks({ status: "open" }),
          areDoneTasksExpanded
            ? getTasks({ status: "done" })
            : Promise.resolve([]),
        ]);

        setTasks(mergeTasksById(openTasksFromServer, doneTasksFromServer));

        if (areDoneTasksExpanded) {
          setHasLoadedDoneTasks(true);
        }
      } catch (searchError) {
        setError(getErrorMessage(searchError));
      } finally {
        setIsLoadingDoneTasks(false);
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [areDoneTasksExpanded, isAuthenticated, isLoading, searchQuery]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        task.title.toLowerCase().includes(query) ||
        (task.description ?? "").toLowerCase().includes(query);

      if (!matchesSearch) {
        return false;
      }

      if (activeAssigneeFilter === "all") {
        return true;
      }

      if (activeAssigneeFilter === "unassigned") {
        return isUnassignedTask(task, profiles);
      }

      return task.assignedTo === activeAssigneeFilter;
    });
  }, [activeAssigneeFilter, profiles, searchQuery, tasks]);
  const openTasks = useMemo(
    () =>
      filteredTasks
        .filter((task) => task.status === "open")
        .sort(sortTasksForDay),
    [filteredTasks],
  );
  const doneTasks = useMemo(
    () =>
      filteredTasks
        .filter((task) => task.status === "done")
        .sort(sortTasksForDay),
    [filteredTasks],
  );
  const isSearching = searchQuery.trim().length > 0;
  const shouldShowDoneTasks = isSearching || areDoneTasksExpanded;
  const hasUnassignedTasks = tasks.some((task) =>
    isUnassignedTask(task, profiles),
  );

  async function signIn(password: string) {
    setIsSubmitting(true);
    setError(undefined);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });
      const body = await response.json();

      if (!response.ok) {
        setError(body.error ?? "Inloggen is mislukt.");
        return;
      }

      setIsAuthenticated(true);
      const [nextProfiles, nextTasks] = await Promise.all([
        getProfiles(),
        getTasks({ status: "open" }),
      ]);

      setProfiles(nextProfiles);
      setTasks(nextTasks);
    } catch (signInError) {
      setError(getErrorMessage(signInError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleTaskStatus(task: Task) {
    const nextStatus = task.status === "done" ? "open" : "done";
    setError(undefined);

    try {
      const updatedTask = await updateTaskStatus(task.id, nextStatus);
      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === task.id ? updatedTask : currentTask,
        ),
      );
    } catch (toggleError) {
      setError(getErrorMessage(toggleError));
    }
  }

  async function assignTask(task: Task, profileId: string) {
    setError(undefined);

    try {
      const updatedTask = await updateTaskAssignee(task.id, profileId);
      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === task.id ? updatedTask : currentTask,
        ),
      );
    } catch (assignError) {
      setError(getErrorMessage(assignError));
    }
  }

  async function toggleTaskPriority(task: Task) {
    const nextPriority = task.priority === "high" ? "normal" : "high";
    setError(undefined);

    try {
      const updatedTask = await updateTaskPriority(task.id, nextPriority);
      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === task.id ? updatedTask : currentTask,
        ),
      );
    } catch (priorityError) {
      setError(getErrorMessage(priorityError));
    }
  }

  function openNewTaskModal() {
    setForm(emptyForm());
    setFormErrors({});
    setIsModalOpen(true);
  }

  function closeNewTaskModal() {
    setIsModalOpen(false);
    setFormErrors({});
  }

  async function refreshOverview() {
    setIsRefreshing(true);
    setError(undefined);

    try {
      const query = searchQuery.trim();
      const [nextProfiles, nextTasks] = await Promise.all([
        getProfiles(),
        query
          ? getTasks({ searchQuery: query })
          : getTasks({ status: "open" }),
      ]);

      if (!query && areDoneTasksExpanded) {
        const doneTasksFromServer = await getTasks({ status: "done" });
        setTasks(mergeTasksById(nextTasks, doneTasksFromServer));
        setHasLoadedDoneTasks(true);
      } else {
        setTasks(nextTasks);
      }

      setProfiles(nextProfiles);
    } catch (refreshError) {
      setError(getErrorMessage(refreshError));
    } finally {
      setIsRefreshing(false);
    }
  }

  async function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm(form);

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      return;
    }

    setIsSavingTask(true);
    setError(undefined);

    try {
      const newTasks = await createTask({
        title: form.title.trim(),
        description: form.description.trim(),
        taskDate: today,
        assignedTo: form.assignedTo,
        repeat: "none",
        repeatUntil: "",
      });

      setTasks((currentTasks) => mergeTasksById(newTasks, currentTasks));
      setIsModalOpen(false);
      setFormErrors({});
      setSearchQuery("");
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setIsSavingTask(false);
    }
  }

  function toggleDoneTasksSection() {
    const nextExpandedState = !areDoneTasksExpanded;
    setAreDoneTasksExpanded(nextExpandedState);

    if (!nextExpandedState) {
      setIsLoadingDoneTasks(false);
    }
  }

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f7f1] px-6">
        <div className="rounded-3xl border border-[#b9cdb7] bg-white px-5 py-4 text-sm font-medium text-[#5e6656] shadow-sm">
          Taakoverzicht laden...
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginForm error={error} isSubmitting={isSubmitting} onSubmit={signIn} />
    );
  }

  return (
    <main className="min-h-screen bg-transparent">
      <section className="mx-auto w-full max-w-3xl px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <div className="sticky top-0 z-10 -mx-4 mb-4 border-b border-[#d7e3ce] bg-[#fffdf7]/92 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              aria-label="Terug naar dashboard"
              title="Terug naar dashboard"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#b9cdb7] bg-white text-[#347468] shadow-sm transition hover:border-[#e66d35] hover:bg-[#fff2b8]/35"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0 text-right">
              <h1 className="truncate text-base font-semibold text-[#244f45]">
                Taakoverzicht
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={refreshOverview}
                disabled={isRefreshing}
                aria-label="Taakoverzicht verversen"
                title="Taakoverzicht verversen"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#b9cdb7] bg-white text-[#347468] shadow-sm transition hover:border-[#e66d35] hover:bg-[#fff2b8]/35 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </button>
              <button
                type="button"
                onClick={openNewTaskModal}
                aria-label="Nieuwe taak"
                title="Nieuwe taak"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#244f45] text-[#fff2b8] shadow-[0_10px_24px_rgba(36,79,69,0.2)] transition hover:-translate-y-0.5 hover:bg-[#347468]"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="grid gap-3"
        >
          <div className="flex gap-2 overflow-x-auto pb-1">
            <FilterChip
              label="Alle"
              isActive={activeAssigneeFilter === "all"}
              onClick={() => setActiveAssigneeFilter("all")}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#244f45] text-white">
                <UsersRound className="h-4 w-4" />
              </span>
            </FilterChip>
            {profiles.map((profile) => (
              <FilterChip
                key={profile.id}
                label={profile.fullName}
                isActive={activeAssigneeFilter === profile.id}
                onClick={() => setActiveAssigneeFilter(profile.id)}
              >
                <UserAvatar profile={profile} />
              </FilterChip>
            ))}
            <FilterChip
              label="Niet toegewezen"
              isActive={activeAssigneeFilter === "unassigned"}
              onClick={() => setActiveAssigneeFilter("unassigned")}
              isMuted={!hasUnassignedTasks}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-300 text-sm font-bold text-neutral-700">
                ?
              </span>
            </FilterChip>
          </div>

          <label className="grid gap-2">
            <span className="sr-only">Zoeken</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Zoek op taak of notitie"
              className="h-11 rounded-full border border-[#b9cdb7] bg-white px-4 text-sm font-medium text-[#183b35] outline-none transition placeholder:text-[#739386] focus:border-[#e66d35] focus:ring-2 focus:ring-[#e66d35]/15"
            />
          </label>

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {openTasks.length === 0 &&
          (!shouldShowDoneTasks || doneTasks.length === 0) ? (
            <div className="rounded-3xl border border-dashed border-[#b9cdb7] bg-[#fff2b8]/35 px-5 py-12 text-center">
              <p className="font-semibold text-[#244f45]">
                Geen taken gevonden.
              </p>
              <p className="mt-2 text-sm text-[#347468]">
                Pas je filter of zoekterm aan om meer taken te zien.
              </p>
            </div>
          ) : null}

          {openTasks.map((task) => (
            <TaskOverviewCard
              key={task.id}
              task={task}
              profiles={profiles}
              assignee={profiles.find(
                (profile) => profile.id === task.assignedTo,
              )}
              onToggle={() => toggleTaskStatus(task)}
              onAssign={(profileId) => assignTask(task, profileId)}
              onTogglePriority={() => toggleTaskPriority(task)}
            />
          ))}

          {isSearching ? (
            doneTasks.length > 0 ? (
              <div className="pt-2">
                <p className="mb-3 inline-flex rounded-full bg-[#b6c8df]/25 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#244f45]">
                  Afgerond in zoekresultaten
                </p>
                <div className="grid gap-3 opacity-80">
                  {doneTasks.map((task) => (
                    <TaskOverviewCard
                      key={task.id}
                      task={task}
                      profiles={profiles}
                      assignee={profiles.find(
                        (profile) => profile.id === task.assignedTo,
                      )}
                      onToggle={() => toggleTaskStatus(task)}
                      onAssign={(profileId) => assignTask(task, profileId)}
                      onTogglePriority={() => toggleTaskPriority(task)}
                    />
                  ))}
                </div>
              </div>
            ) : null
          ) : (
            <div className="pt-2">
              <button
                type="button"
                onClick={toggleDoneTasksSection}
                className="flex w-full items-center justify-between rounded-3xl border border-[#b9cdb7] bg-white/90 px-4 py-3 text-left text-sm font-semibold text-[#244f45] shadow-sm transition hover:border-[#e66d35]/70 hover:bg-[#fff2b8]/25"
                aria-expanded={areDoneTasksExpanded}
              >
                <span>
                  Afgeronde taken
                  {hasLoadedDoneTasks ? (
                    <span className="ml-2 text-xs font-medium text-[#7d8b38]">
                      {doneTasks.length}
                    </span>
                  ) : null}
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition ${
                    areDoneTasksExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {areDoneTasksExpanded ? (
                <div className="mt-3 grid gap-3 opacity-80">
                  {isLoadingDoneTasks ? (
                    <div className="rounded-3xl border border-[#d7e3ce] bg-white px-4 py-5 text-center text-sm font-medium text-[#5e6656]">
                      Afgeronde taken laden...
                    </div>
                  ) : null}

                  {!isLoadingDoneTasks &&
                  hasLoadedDoneTasks &&
                  doneTasks.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-[#b9cdb7] bg-[#fff2b8]/25 px-4 py-5 text-center text-sm font-medium text-[#347468]">
                      Geen afgeronde taken gevonden.
                    </div>
                  ) : null}

                  {doneTasks.map((task) => (
                    <TaskOverviewCard
                      key={task.id}
                      task={task}
                      profiles={profiles}
                      assignee={profiles.find(
                        (profile) => profile.id === task.assignedTo,
                      )}
                      onToggle={() => toggleTaskStatus(task)}
                      onAssign={(profileId) => assignTask(task, profileId)}
                      onTogglePriority={() => toggleTaskPriority(task)}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </motion.div>
      </section>
      {isModalOpen ? (
        <NewTaskModal
          form={form}
          errors={formErrors}
          profiles={profiles}
          isSaving={isSavingTask}
          onChange={updateForm}
          onCancel={closeNewTaskModal}
          onSubmit={saveTask}
        />
      ) : null}
    </main>
  );

  function updateForm(field: keyof NewTaskForm, value: string) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
    setFormErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
  }
}

function FilterChip({
  label,
  isActive,
  isMuted = false,
  children,
  onClick,
}: {
  label: string;
  isActive: boolean;
  isMuted?: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-[76px] shrink-0 flex-col items-center gap-1 rounded-2xl border px-2 py-2 text-xs font-semibold transition active:scale-[0.98] ${
        isActive
          ? "border-[#244f45] bg-white text-[#244f45] shadow-sm ring-2 ring-[#e66d35]/10"
          : "border-[#b9cdb7] bg-[#f4fbf3] text-[#5e6656] hover:border-[#e66d35]/60 hover:bg-white"
      } ${isMuted ? "opacity-60" : ""}`}
    >
      {children}
      <span className="max-w-[70px] truncate">{label}</span>
    </button>
  );
}

function isUnassignedTask(task: Task, profiles: Profile[]) {
  return (
    !task.assignedTo ||
    !profiles.some((profile) => profile.id === task.assignedTo)
  );
}

function sortTasksForDay(first: Task, second: Task) {
  if (first.priority !== second.priority) {
    return first.priority === "high" ? -1 : 1;
  }

  return second.createdAt.localeCompare(first.createdAt);
}

function mergeTasksById(firstList: Task[], secondList: Task[]) {
  const tasksById = new Map<string, Task>();

  for (const task of [...firstList, ...secondList]) {
    tasksById.set(task.id, task);
  }

  return Array.from(tasksById.values());
}

function validateForm(form: NewTaskForm) {
  const errors: TaskFormErrors = {};

  if (!form.title.trim()) {
    errors.title = "Vul een titel in voordat je de taak opslaat.";
  }

  return errors;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Er ging iets mis. Probeer het opnieuw.";
}

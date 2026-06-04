"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { BarChart3, Clock3, Plus, RefreshCw, Sparkles } from "lucide-react";
import { NewTaskModal } from "@/components/NewTaskModal";
import { TaskFilters } from "@/components/TaskFilters";
import { TaskList } from "@/components/TaskList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTaskAssignee,
  updateTaskDescription,
  updateTaskPriority,
} from "@/lib/tasks";
import { getProfiles } from "@/lib/profiles";
import type {
  NewTaskForm,
  Profile,
  Task,
  TaskFilter,
  TaskFormErrors,
} from "@/types/task";

const today = new Date().toISOString().slice(0, 10);

const emptyForm = (assignedTo = ""): NewTaskForm => ({
  title: "",
  description: "",
  taskDate: today,
  assignedTo,
  repeat: "none",
  repeatUntil: "",
});

export function TaskDayOverview() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<NewTaskForm>(() => emptyForm());
  const [formErrors, setFormErrors] = useState<TaskFormErrors>({});
  const [activeFilter, setActiveFilter] = useState<TaskFilter>("alle");
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [dataError, setDataError] = useState<string | undefined>();

  useEffect(() => {
    let isMounted = true;

    async function loadProfiles() {
      try {
        const nextProfiles = await getProfiles();

        if (!isMounted) {
          return;
        }

        setProfiles(nextProfiles);
      } catch (error) {
        if (isMounted) {
          setDataError(getErrorMessage(error));
        }
      }
    }

    loadProfiles();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      setIsLoadingTasks(true);
      setDataError(undefined);

      try {
        const nextTasks = await getTasks();

        if (!isMounted) {
          return;
        }

        setTasks(nextTasks);
      } catch (error) {
        if (isMounted) {
          setDataError(getErrorMessage(error));
        }
      } finally {
        if (isMounted) {
          setIsLoadingTasks(false);
        }
      }
    }

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (activeFilter === "open" || activeFilter === "done") {
        return task.status === activeFilter;
      }

      return true;
    }).sort(sortTasksForPlanning);
  }, [activeFilter, tasks]);

  const openTasks = tasks.filter((task) => task.status === "open").length;
  const dashboardStats = useMemo(() => buildDashboardStats(tasks), [tasks]);

  function openNewTaskModal() {
    setForm(emptyForm());
    setFormErrors({});
    setIsModalOpen(true);
  }

  function closeNewTaskModal() {
    setIsModalOpen(false);
    setFormErrors({});
  }

  async function refreshDashboard() {
    setIsRefreshing(true);
    setDataError(undefined);

    try {
      const [nextProfiles, nextTasks] = await Promise.all([
        getProfiles(),
        getTasks(),
      ]);

      setProfiles(nextProfiles);
      setTasks(nextTasks);
    } catch (error) {
      setDataError(getErrorMessage(error));
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
    setDataError(undefined);

    try {
      const newTasks = await createTask({
        title: form.title.trim(),
        description: form.description.trim(),
        taskDate: today,
        assignedTo: form.assignedTo,
        repeat: "none",
        repeatUntil: "",
      });

      setTasks((currentTasks) => [...newTasks, ...currentTasks]);

      setActiveFilter("alle");
      setIsModalOpen(false);
      setFormErrors({});
    } catch (error) {
      setDataError(getErrorMessage(error));
    } finally {
      setIsSavingTask(false);
    }
  }

  async function removeTask(taskId: string) {
    const confirmed = window.confirm("Weet je zeker dat je deze taak wilt verwijderen?");

    if (!confirmed) {
      return;
    }

    setDataError(undefined);

    try {
      await deleteTask(taskId);
      setTasks((currentTasks) =>
        currentTasks.filter((currentTask) => currentTask.id !== taskId),
      );
    } catch (error) {
      setDataError(getErrorMessage(error));
    }
  }

  async function assignTask(taskId: string, profileId: string) {
    setDataError(undefined);

    try {
      const updatedTask = await updateTaskAssignee(taskId, profileId);
      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === taskId ? updatedTask : currentTask,
        ),
      );
    } catch (error) {
      setDataError(getErrorMessage(error));
    }
  }

  async function updateDescription(taskId: string, description: string) {
    setDataError(undefined);

    try {
      const updatedTask = await updateTaskDescription(taskId, description);
      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === taskId ? updatedTask : currentTask,
        ),
      );
    } catch (error) {
      setDataError(getErrorMessage(error));
    }
  }

  async function togglePriority(taskId: string) {
    const task = tasks.find((currentTask) => currentTask.id === taskId);

    if (!task) {
      return;
    }

    const nextPriority = task.priority === "high" ? "normal" : "high";
    setDataError(undefined);

    try {
      const updatedTask = await updateTaskPriority(taskId, nextPriority);
      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === taskId ? updatedTask : currentTask,
        ),
      );
    } catch (error) {
      setDataError(getErrorMessage(error));
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-6"
      >
        <Card className="overflow-hidden">
          <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#347468]">
                <Sparkles className="h-4 w-4 text-[#e66d35]" />
                Dashboard
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-normal text-[#183b35] sm:text-3xl">
                Gezinsbord
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5e6656]">
                Snelle blik op wat nog ligt, wat al gelukt is en waar het huis vandaag om vraagt.
              </p>
            </div>

            <div className="grid gap-2 sm:min-w-44">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={refreshDashboard}
                  disabled={isRefreshing}
                  aria-label="Dashboard verversen"
                  title="Dashboard verversen"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#b9cdb7] bg-white text-[#347468] shadow-sm transition hover:border-[#e66d35] hover:bg-[#fff2b8]/35 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      isRefreshing ? "animate-spin" : ""
                    }`}
                  />
                </button>
                <Button
                  id="nieuwe-taak"
                  onClick={openNewTaskModal}
                  size="lg"
                  className="min-w-0 flex-1"
                >
                  <Plus className="h-4 w-4" />
                  Nieuwe taak
                </Button>
              </div>
              <p className="text-center text-xs font-semibold uppercase tracking-wide text-[#7d8b38]">
                {openTasks} open
              </p>
            </div>
          </div>
          {dataError ? (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {dataError}
            </p>
          ) : null}
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <DashboardStatCard
              icon={<BarChart3 className="h-4 w-4" />}
              label="Nog te doen"
              value={dashboardStats.openTasks.toString()}
              helper={`${dashboardStats.doneTasks} al afgevinkt`}
            />
            <DashboardStatCard
              icon={<Sparkles className="h-4 w-4" />}
              label="Deze week"
              value={dashboardStats.doneLastWeek.toString()}
              helper="klusjes afgerond"
            />
            <DashboardStatCard
              icon={<Clock3 className="h-4 w-4" />}
              label="Gemiddeld klaar"
              value={dashboardStats.averageCompletionLabel}
              helper="van opschrijven tot afvinken"
            />
          </div>
          </CardContent>
        </Card>

        <section
          id="taken"
          aria-labelledby="task-list-heading"
          className="grid gap-6"
        >
          <Card className="overflow-hidden">
            <div className="space-y-4 border-b border-[#d7e3ce] px-5 py-4 sm:px-6">
              <h2
                id="task-list-heading"
                className="text-lg font-semibold text-[#183b35]"
              >
                Huislijst
              </h2>
              <TaskFilters
                activeFilter={activeFilter}
                onChange={setActiveFilter}
              />
            </div>

            <TaskList
              tasks={visibleTasks}
              hasTasksForDate={tasks.length > 0}
              isLoading={isLoadingTasks}
              profiles={profiles}
              onDeleteTask={removeTask}
              onAssignTask={assignTask}
              onUpdateTaskDescription={updateDescription}
              onToggleTaskPriority={togglePriority}
              onCreateTask={openNewTaskModal}
              onClearFilter={() => setActiveFilter("alle")}
            />
          </Card>
        </section>
      </motion.div>

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
    </>
  );

  function updateForm(field: keyof NewTaskForm, value: string) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
    setFormErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
  }
}

function DashboardStatCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-3xl border border-[#d7e3ce] bg-[#fffdf7] p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#347468]">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#fff2b8] text-[#e66d35]">
          {icon}
        </span>
        {label}
      </div>
      <p className="mt-3 truncate text-2xl font-semibold text-[#183b35]">
        {value}
      </p>
      <p className="mt-1 text-sm font-medium text-[#5e6656]">{helper}</p>
    </div>
  );
}

function buildDashboardStats(tasks: Task[]) {
  const doneTasks = tasks.filter((task) => task.status === "done");
  const now = new Date();
  const lastWeek = new Date(now);
  lastWeek.setDate(now.getDate() - 7);
  const completionDurations = doneTasks
    .map((task) => getDaysBetween(task.createdAt, task.updatedAt))
    .filter((days) => days >= 0);
  const averageCompletionDays =
    completionDurations.length > 0
      ? completionDurations.reduce((total, days) => total + days, 0) /
        completionDurations.length
      : undefined;
  return {
    openTasks: tasks.filter((task) => task.status === "open").length,
    doneTasks: doneTasks.length,
    doneLastWeek: doneTasks.filter(
      (task) => new Date(task.updatedAt).getTime() >= lastWeek.getTime(),
    ).length,
    averageCompletionLabel:
      averageCompletionDays === undefined
        ? "-"
        : averageCompletionDays < 1
          ? "zelfde dag"
          : `${averageCompletionDays.toFixed(1)} dagen`,
  };
}

function getDaysBetween(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return -1;
  }

  return Math.max(0, (end.getTime() - start.getTime()) / 86_400_000);
}

function sortTasksForPlanning(first: Task, second: Task) {
  if (first.status !== second.status) {
    return first.status === "open" ? -1 : 1;
  }

  if (first.priority !== second.priority) {
    return first.priority === "high" ? -1 : 1;
  }

  return second.createdAt.localeCompare(first.createdAt);
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

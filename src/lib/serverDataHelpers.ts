import type { Database } from "@/types/database";
import type { NewTaskForm, Profile, Task } from "@/types/task";

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
type TaskRecord = TaskRow | Omit<TaskRow, "priority">;
type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileRecord = ProfileRow | Omit<ProfileRow, "profile_color">;

type CreateTaskInput = NewTaskForm & {
  createdBy?: string | null;
};

export const unassignedProfileEmail = "__unassigned__@familie.local";

export function buildTaskInsertPayload(input: CreateTaskInput): TaskInsert[] {
  const now = new Date().toISOString();

  return getTaskDates(input).map((taskDate) => ({
    id: crypto.randomUUID(),
    title: input.title.trim(),
    description: input.description.trim() || null,
    task_date: taskDate,
    assigned_to: input.assignedTo || null,
    created_by: input.createdBy ?? null,
    status: "open",
    priority: "normal",
    created_at: now,
    updated_at: now,
  }));
}

export function fillRequiredTaskRelations(
  payload: TaskInsert[],
  fallbackProfileId: string,
): TaskInsert[] {
  return payload.map((task) => ({
    ...task,
    assigned_to: task.assigned_to || fallbackProfileId,
    created_by: task.created_by || fallbackProfileId,
  }));
}

export function mapTask(row: TaskRecord): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    taskDate: row.task_date,
    assignedTo: row.assigned_to ?? "",
    createdBy: row.created_by ?? "",
    status: row.status,
    priority: "priority" in row && row.priority ? row.priority : "normal",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapProfile(row: ProfileRecord): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    avatarUrl: row.avatar_url ?? undefined,
    profileColor:
      "profile_color" in row && row.profile_color
        ? row.profile_color
        : "#347468",
  };
}

export function createInternalProfileEmail(fullName: string, now = Date.now()) {
  const slug = fullName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

  return `${slug || "gezinslid"}-${now}@familie.local`;
}

export function getDatabaseErrorMessage(action: string, error: unknown) {
  const message =
    error && typeof error === "object" && "message" in error
      ? String(error.message)
      : "";
  const code =
    error && typeof error === "object" && "code" in error
      ? String(error.code)
      : "";

  if (message.includes("assigned_to")) {
    return `${action}: de databasekolom assigned_to accepteert geen lege waarde. Voer supabase/schema.sql opnieuw uit.`;
  }

  if (message.includes("created_by")) {
    return `${action}: de databasekolom created_by accepteert geen lege waarde. Voer supabase/schema.sql opnieuw uit.`;
  }

  if (message.includes("profile_color")) {
    return `${action}: de database mist profile_color. Voer supabase/schema.sql opnieuw uit.`;
  }

  if (message.includes("priority")) {
    return `${action}: de database mist priority. Voer supabase/schema.sql opnieuw uit.`;
  }

  if (code === "42501" || message.toLowerCase().includes("row-level security")) {
    return `${action}: database policy blokkeert deze actie. Controleer supabase/policies.sql en de service role key.`;
  }

  if (message) {
    const shortMessage = message.replace(/\s+/g, " ").slice(0, 180);
    return code
      ? `${action}: Supabase ${code} - ${shortMessage}`
      : `${action}: ${shortMessage}`;
  }

  return action;
}

export function isRequiredTaskRelationError(error: unknown) {
  const message =
    error && typeof error === "object" && "message" in error
      ? String(error.message)
      : "";

  return message.includes("assigned_to") || message.includes("created_by");
}

export function isMissingProfileColorError(error: { message?: string }) {
  return error.message?.includes("profile_color") ?? false;
}

export function isMissingTaskPriorityError(error: { message?: string }) {
  return error.message?.includes("priority") ?? false;
}

function getTaskDates(input: NewTaskForm) {
  if (input.repeat === "none") {
    return [input.taskDate];
  }

  const startDate = parseDate(input.taskDate);
  const endDate = parseDate(input.repeatUntil);
  const startDayOfWeek = startDate.getDay();
  const dates: string[] = [];

  for (
    const currentDate = startDate;
    currentDate <= endDate && dates.length < 180;
    currentDate.setDate(currentDate.getDate() + 1)
  ) {
    const dayOfWeek = currentDate.getDay();
    const shouldCreate =
      input.repeat === "daily" ||
      (input.repeat === "weekdays" && dayOfWeek >= 1 && dayOfWeek <= 5) ||
      (input.repeat === "weekly" && dayOfWeek === startDayOfWeek);

    if (shouldCreate) {
      dates.push(formatDate(currentDate));
    }
  }

  return dates;
}

function parseDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

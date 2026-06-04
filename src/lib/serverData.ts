import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  buildTaskInsertPayload,
  createInternalProfileEmail,
  fillRequiredTaskRelations,
  getDatabaseErrorMessage,
  isMissingProfileColorError,
  isMissingTaskPriorityError,
  isRequiredTaskRelationError,
  mapProfile,
  mapTask,
  unassignedProfileEmail,
} from "@/lib/serverDataHelpers";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  NewProfileForm,
  NewTaskForm,
  Profile,
  Task,
  TaskStatus,
} from "@/types/task";

type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];

type CreateTaskInput = NewTaskForm & {
  createdBy?: string | null;
};

type GetTasksOptions = {
  searchQuery?: string;
  status?: TaskStatus;
  limit?: number;
};

const taskSelect =
  "id,title,description,task_date,assigned_to,created_by,status,priority,created_at,updated_at";
const legacyTaskSelect =
  "id,title,description,task_date,assigned_to,created_by,status,created_at,updated_at";
const defaultTaskLimit = 150;
const searchTaskLimit = 100;

export async function getProfilesFromDatabase(): Promise<Profile[]> {
  const client = getSupabaseServerClient();

  const result = await client
    .from("profiles")
    .select("id,full_name,email,role,avatar_url,profile_color,created_at")
    .order("full_name", { ascending: true });

  if (!result.error) {
    return (result.data ?? [])
      .filter((profile) => profile.email !== unassignedProfileEmail)
      .map(mapProfile);
  }

  if (!isMissingProfileColorError(result.error)) {
    throw new Error(
      getDatabaseErrorMessage("Profielen laden is mislukt", result.error),
    );
  }

  const fallbackResult = await client
    .from("profiles")
    .select("id,full_name,email,role,avatar_url,created_at")
    .order("full_name", { ascending: true });

  if (fallbackResult.error) {
    throw new Error(
      getDatabaseErrorMessage(
        "Profielen laden is mislukt",
        fallbackResult.error,
      ),
    );
  }

  return (fallbackResult.data ?? [])
    .filter((profile) => profile.email !== unassignedProfileEmail)
    .map(mapProfile);
}

export async function getTasksByDateFromDatabase(
  taskDate: string,
): Promise<Task[]> {
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from("tasks")
    .select(taskSelect)
    .eq("task_date", taskDate)
    .order("created_at", { ascending: false });

  if (error && isMissingTaskPriorityError(error)) {
    const fallbackResult = await client
      .from("tasks")
      .select(legacyTaskSelect)
      .eq("task_date", taskDate)
      .order("created_at", { ascending: false });

    if (fallbackResult.error) {
      throw new Error(
        getDatabaseErrorMessage("Taken laden is mislukt", fallbackResult.error),
      );
    }

    return (fallbackResult.data ?? []).map(mapTask);
  }

  if (error) {
    throw new Error(getDatabaseErrorMessage("Taken laden is mislukt", error));
  }

  return (data ?? []).map(mapTask);
}

export async function getTasksFromDatabase(
  options: GetTasksOptions = {},
): Promise<Task[]> {
  const client = getSupabaseServerClient();
  const searchQuery = normalizeTaskSearchQuery(options.searchQuery);
  const status = searchQuery ? undefined : options.status;
  const limit = options.limit ?? (searchQuery ? searchTaskLimit : defaultTaskLimit);

  await deleteExpiredCompletedTasks(client);

  let query = client.from("tasks").select(taskSelect);

  if (searchQuery) {
    const pattern = `%${searchQuery}%`;
    query = query.or(`title.ilike.${pattern},description.ilike.${pattern}`);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const orderedQuery = status ? query : query.order("status", { ascending: false });

  const { data, error } = await orderedQuery
    .order("priority", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error && isMissingTaskPriorityError(error)) {
    let fallbackQuery = client.from("tasks").select(legacyTaskSelect);

    if (searchQuery) {
      const pattern = `%${searchQuery}%`;
      fallbackQuery = fallbackQuery.or(
        `title.ilike.${pattern},description.ilike.${pattern}`,
      );
    }

    if (status) {
      fallbackQuery = fallbackQuery.eq("status", status);
    }

    const orderedFallbackQuery = status
      ? fallbackQuery
      : fallbackQuery.order("status", { ascending: false });

    const fallbackResult = await orderedFallbackQuery
      .order("created_at", { ascending: false })
      .limit(limit);

    if (fallbackResult.error) {
      throw new Error(
        getDatabaseErrorMessage("Taken laden is mislukt", fallbackResult.error),
      );
    }

    return (fallbackResult.data ?? []).map(mapTask);
  }

  if (error) {
    throw new Error(getDatabaseErrorMessage("Taken laden is mislukt", error));
  }

  return (data ?? []).map(mapTask);
}

export async function createProfileInDatabase(
  input: NewProfileForm,
): Promise<Profile> {
  const client = getSupabaseServerClient();
  const payload: ProfileInsert = {
    id: crypto.randomUUID(),
    full_name: input.fullName.trim(),
    email: createInternalProfileEmail(input.fullName),
    role: "member",
    avatar_url: input.avatarUrl.trim() || null,
    profile_color: input.profileColor,
    created_at: new Date().toISOString(),
  };

  const result = await client
    .from("profiles")
    .insert(payload)
    .select("id,full_name,email,role,avatar_url,profile_color,created_at")
    .single();

  if (!result.error) {
    return mapProfile(result.data);
  }

  if (!isMissingProfileColorError(result.error)) {
    throw new Error(
      getDatabaseErrorMessage("Gezinslid opslaan is mislukt", result.error),
    );
  }

  const fallbackPayload: ProfileInsert = {
    full_name: payload.full_name,
    email: payload.email,
    role: payload.role,
    avatar_url: payload.avatar_url,
  };
  const fallbackResult = await client
    .from("profiles")
    .insert(fallbackPayload)
    .select("id,full_name,email,role,avatar_url,created_at")
    .single();

  if (fallbackResult.error) {
    throw new Error(
      getDatabaseErrorMessage(
        "Gezinslid opslaan is mislukt",
        fallbackResult.error,
      ),
    );
  }

  return mapProfile({
    ...fallbackResult.data,
    profile_color: input.profileColor,
  });
}

export async function createTasksInDatabase(
  input: CreateTaskInput,
): Promise<Task[]> {
  const client = getSupabaseServerClient();
  const payload = buildTaskInsertPayload(input);

  const { data, error } = await client
    .from("tasks")
    .insert(payload)
    .select(taskSelect);

  if (error) {
    if (isMissingTaskPriorityError(error)) {
      const retryPayload = payload.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        task_date: task.task_date,
        assigned_to: task.assigned_to,
        created_by: task.created_by,
        status: task.status,
        created_at: task.created_at,
        updated_at: task.updated_at,
      }));
      const retryResult = await client
        .from("tasks")
        .insert(retryPayload)
        .select(legacyTaskSelect);

      if (!retryResult.error) {
        return (retryResult.data ?? []).map(mapTask);
      }
    }

    if (isRequiredTaskRelationError(error)) {
      const fallbackProfileId = await ensureUnassignedProfile(client);
      const retryPayload = fillRequiredTaskRelations(payload, fallbackProfileId);
      const retryResult = await client
        .from("tasks")
        .insert(retryPayload)
        .select(taskSelect);

      if (!retryResult.error) {
        return (retryResult.data ?? []).map(mapTask);
      }

      throw new Error(
        getDatabaseErrorMessage("Taak opslaan is mislukt", retryResult.error),
      );
    }

    throw new Error(getDatabaseErrorMessage("Taak opslaan is mislukt", error));
  }

  return (data ?? []).map(mapTask);
}

export async function updateTaskStatusInDatabase(
  taskId: string,
  status: TaskStatus,
): Promise<Task> {
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from("tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", taskId)
    .select(taskSelect)
    .single();

  if (error && isMissingTaskPriorityError(error)) {
    const fallbackResult = await client
      .from("tasks")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", taskId)
      .select(legacyTaskSelect)
      .single();

    if (!fallbackResult.error) {
      return mapTask(fallbackResult.data);
    }

    throw new Error(
      getDatabaseErrorMessage(
        "Taakstatus bijwerken is mislukt",
        fallbackResult.error,
      ),
    );
  }

  if (error) {
    throw new Error(
      getDatabaseErrorMessage("Taakstatus bijwerken is mislukt", error),
    );
  }

  return mapTask(data);
}

export async function deleteTaskFromDatabase(taskId: string): Promise<void> {
  const client = getSupabaseServerClient();
  const { error } = await client.from("tasks").delete().eq("id", taskId);

  if (error) {
    throw new Error(
      getDatabaseErrorMessage("Taak verwijderen is mislukt", error),
    );
  }
}

export async function updateTaskAssigneeInDatabase(
  taskId: string,
  assignedTo: string,
): Promise<Task> {
  const client = getSupabaseServerClient();
  const payload = {
    assigned_to: assignedTo || null,
    updated_at: new Date().toISOString(),
  };
  const result = await client
    .from("tasks")
    .update(payload)
    .eq("id", taskId)
    .select(taskSelect)
    .single();

  if (!result.error) {
    return mapTask(result.data);
  }

  if (isMissingTaskPriorityError(result.error)) {
    const fallbackResult = await client
      .from("tasks")
      .update(payload)
      .eq("id", taskId)
      .select(legacyTaskSelect)
      .single();

    if (!fallbackResult.error) {
      return mapTask(fallbackResult.data);
    }
  }

  if (isRequiredTaskRelationError(result.error)) {
    const fallbackProfileId = await ensureUnassignedProfile(client);
    const retryResult = await client
      .from("tasks")
      .update({
        assigned_to: assignedTo || fallbackProfileId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .select(taskSelect)
      .single();

    if (!retryResult.error) {
      return mapTask(retryResult.data);
    }

    throw new Error(
      getDatabaseErrorMessage("Taak toewijzen is mislukt", retryResult.error),
    );
  }

  throw new Error(
    getDatabaseErrorMessage("Taak toewijzen is mislukt", result.error),
  );
}

export async function updateTaskDescriptionInDatabase(
  taskId: string,
  description: string,
): Promise<Task> {
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from("tasks")
    .update({
      description: description.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .select(taskSelect)
    .single();

  if (error && isMissingTaskPriorityError(error)) {
    const fallbackResult = await client
      .from("tasks")
      .update({
        description: description.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .select(legacyTaskSelect)
      .single();

    if (!fallbackResult.error) {
      return mapTask(fallbackResult.data);
    }

    throw new Error(
      getDatabaseErrorMessage(
        "Notitie bijwerken is mislukt",
        fallbackResult.error,
      ),
    );
  }

  if (error) {
    throw new Error(
      getDatabaseErrorMessage("Notitie bijwerken is mislukt", error),
    );
  }

  return mapTask(data);
}

export async function updateTaskPriorityInDatabase(
  taskId: string,
  priority: Task["priority"],
): Promise<Task> {
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from("tasks")
    .update({
      priority,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .select(taskSelect)
    .single();

  if (error) {
    throw new Error(
      getDatabaseErrorMessage("Prioriteit bijwerken is mislukt", error),
    );
  }

  return mapTask(data);
}

export async function deleteProfileFromDatabase(profileId: string): Promise<void> {
  const client = getSupabaseServerClient();
  const { error } = await client.from("profiles").delete().eq("id", profileId);

  if (error) {
    throw new Error(
      getDatabaseErrorMessage("Gezinslid verwijderen is mislukt", error),
    );
  }
}

async function ensureUnassignedProfile(client: SupabaseClient<Database>) {
  const existingResult = await client
    .from("profiles")
    .select("id")
    .eq("email", unassignedProfileEmail)
    .maybeSingle();

  if (existingResult.data?.id) {
    return existingResult.data.id;
  }

  const payload: ProfileInsert = {
    id: crypto.randomUUID(),
    full_name: "Niet toegewezen",
    email: unassignedProfileEmail,
    role: "member",
    avatar_url: null,
    profile_color: "#347468",
    created_at: new Date().toISOString(),
  };

  const result = await client
    .from("profiles")
    .insert(payload)
    .select("id")
    .single();

  if (!result.error) {
    return result.data.id;
  }

  if (!isMissingProfileColorError(result.error)) {
    const retryExistingResult = await client
      .from("profiles")
      .select("id")
      .eq("email", unassignedProfileEmail)
      .maybeSingle();

    if (retryExistingResult.data?.id) {
      return retryExistingResult.data.id;
    }

    throw new Error(
      getDatabaseErrorMessage("Systeemprofiel maken is mislukt", result.error),
    );
  }

  const fallbackPayload: ProfileInsert = {
    full_name: payload.full_name,
    email: payload.email,
    role: payload.role,
    avatar_url: payload.avatar_url,
  };
  const fallbackResult = await client
    .from("profiles")
    .insert(fallbackPayload)
    .select("id")
    .single();

  if (fallbackResult.error) {
    const retryExistingResult = await client
      .from("profiles")
      .select("id")
      .eq("email", unassignedProfileEmail)
      .maybeSingle();

    if (retryExistingResult.data?.id) {
      return retryExistingResult.data.id;
    }

    throw new Error(
      getDatabaseErrorMessage(
        "Systeemprofiel maken is mislukt",
        fallbackResult.error,
      ),
    );
  }

  return fallbackResult.data.id;
}

async function deleteExpiredCompletedTasks(
  client: SupabaseClient<Database>,
): Promise<void> {
  const expiresBefore = new Date();
  expiresBefore.setDate(expiresBefore.getDate() - 14);

  const { error } = await client
    .from("tasks")
    .delete()
    .eq("status", "done")
    .lt("updated_at", expiresBefore.toISOString());

  if (error) {
    throw new Error(
      getDatabaseErrorMessage("Oude afgeronde taken opruimen is mislukt", error),
    );
  }
}

function normalizeTaskSearchQuery(searchQuery?: string) {
  return searchQuery
    ?.trim()
    .replace(/[%_,(){}[\]]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

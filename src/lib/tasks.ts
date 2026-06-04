import type { NewTaskForm, Task, TaskPriority, TaskStatus } from "@/types/task";

type GetTasksOptions = {
  searchQuery?: string;
  status?: TaskStatus;
};

export async function getTasks(options: GetTasksOptions = {}): Promise<Task[]> {
  const searchParams = new URLSearchParams();

  if (options.searchQuery?.trim()) {
    searchParams.set("query", options.searchQuery.trim());
  } else if (options.status) {
    searchParams.set("status", options.status);
  }

  const queryString = searchParams.toString();
  const response = await fetch(`/api/tasks${queryString ? `?${queryString}` : ""}`);
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error ?? "Taken laden is mislukt.");
  }

  return body.tasks;
}

export async function getTasksByDate(taskDate: string): Promise<Task[]> {
  const response = await fetch(`/api/tasks?taskDate=${taskDate}`);
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error ?? "Taken laden is mislukt.");
  }

  return body.tasks;
}

export async function createTask(input: NewTaskForm): Promise<Task[]> {
  const response = await fetch("/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error ?? "Taak opslaan is mislukt.");
  }

  return body.tasks ?? [body.task];
}

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
): Promise<Task> {
  const response = await fetch(`/api/tasks/${taskId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error ?? "Taakstatus bijwerken is mislukt.");
  }

  return body.task;
}

export async function deleteTask(taskId: string): Promise<void> {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: "DELETE",
  });
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error ?? "Taak verwijderen is mislukt.");
  }
}

export async function updateTaskAssignee(
  taskId: string,
  assignedTo: string,
): Promise<Task> {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ assignedTo }),
  });
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error ?? "Taak toewijzen is mislukt.");
  }

  return body.task;
}

export async function updateTaskDescription(
  taskId: string,
  description: string,
): Promise<Task> {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ description }),
  });
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error ?? "Notitie bijwerken is mislukt.");
  }

  return body.task;
}

export async function updateTaskPriority(
  taskId: string,
  priority: TaskPriority,
): Promise<Task> {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ priority }),
  });
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error ?? "Prioriteit bijwerken is mislukt.");
  }

  return body.task;
}

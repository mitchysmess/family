import { NextResponse } from "next/server";
import { isRequestAuthenticated } from "@/lib/appSession";
import {
  createTasksInDatabase,
  getTasksByDateFromDatabase,
  getTasksFromDatabase,
} from "@/lib/serverData";
import type { NewTaskForm, TaskStatus } from "@/types/task";

export async function GET(request: Request) {
  if (!isRequestAuthenticated(request)) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const searchParams = new URL(request.url).searchParams;
  const taskDate = searchParams.get("taskDate");
  const searchQuery = searchParams.get("query") ?? undefined;
  const status = parseTaskStatus(searchParams.get("status"));

  if (searchParams.get("status") && !status) {
    return NextResponse.json(
      { error: "Kies een geldige taakstatus." },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json({
      tasks: taskDate
        ? await getTasksByDateFromDatabase(taskDate)
        : await getTasksFromDatabase({ searchQuery, status }),
    });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!isRequestAuthenticated(request)) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const input = (await request.json().catch(() => null)) as NewTaskForm | null;

  if (!input?.title?.trim()) {
    return NextResponse.json(
      { error: "Vul minimaal een titel in." },
      { status: 400 },
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const normalizedInput: NewTaskForm = {
    ...input,
    taskDate: input.taskDate || today,
    repeat: input.repeat || "none",
    repeatUntil: input.repeatUntil || "",
  };

  if (!["none", "daily", "weekdays", "weekly"].includes(normalizedInput.repeat)) {
    return NextResponse.json(
      { error: "Kies een geldige herhaaloptie." },
      { status: 400 },
    );
  }

  if (normalizedInput.repeat !== "none" && !normalizedInput.repeatUntil) {
    return NextResponse.json(
      { error: "Kies tot wanneer de taak herhaald moet worden." },
      { status: 400 },
    );
  }

  if (
    normalizedInput.repeat !== "none" &&
    normalizedInput.repeatUntil < normalizedInput.taskDate
  ) {
    return NextResponse.json(
      { error: "De einddatum mag niet voor de startdatum liggen." },
      { status: 400 },
    );
  }

  try {
    const tasks = await createTasksInDatabase(normalizedInput);

    return NextResponse.json({
      task: tasks[0],
      tasks,
    });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Taken verwerken is mislukt.";
}

function parseTaskStatus(status: string | null): TaskStatus | undefined {
  if (status === "open" || status === "done") {
    return status;
  }

  return undefined;
}

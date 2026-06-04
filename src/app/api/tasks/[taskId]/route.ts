import { NextResponse } from "next/server";
import { isRequestAuthenticated } from "@/lib/appSession";
import {
  deleteTaskFromDatabase,
  updateTaskAssigneeInDatabase,
  updateTaskDescriptionInDatabase,
  updateTaskPriorityInDatabase,
} from "@/lib/serverData";
import type { TaskPriority } from "@/types/task";

type RouteContext = {
  params: Promise<{
    taskId: string;
  }>;
};

export async function DELETE(request: Request, context: RouteContext) {
  if (!isRequestAuthenticated(request)) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const { taskId } = await context.params;

  try {
    await deleteTaskFromDatabase(taskId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!isRequestAuthenticated(request)) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const { taskId } = await context.params;
  const input = (await request.json().catch(() => null)) as {
    assignedTo?: string;
    description?: string;
    priority?: TaskPriority;
  } | null;

  try {
    if (input?.priority === "normal" || input?.priority === "high") {
      return NextResponse.json({
        task: await updateTaskPriorityInDatabase(taskId, input.priority),
      });
    }

    if (typeof input?.description === "string") {
      return NextResponse.json({
        task: await updateTaskDescriptionInDatabase(taskId, input.description),
      });
    }

    return NextResponse.json({
      task: await updateTaskAssigneeInDatabase(taskId, input?.assignedTo ?? ""),
    });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Taak verwerken is mislukt.";
}

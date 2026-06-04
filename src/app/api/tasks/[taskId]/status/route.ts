import { NextResponse } from "next/server";
import { isRequestAuthenticated } from "@/lib/appSession";
import { updateTaskStatusInDatabase } from "@/lib/serverData";
import type { TaskStatus } from "@/types/task";

type RouteContext = {
  params: Promise<{
    taskId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  if (!isRequestAuthenticated(request)) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const { taskId } = await context.params;
  const { status } = (await request.json().catch(() => ({}))) as {
    status?: TaskStatus;
  };

  if (status !== "open" && status !== "done") {
    return NextResponse.json(
      { error: "Ongeldige taakstatus." },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json({
      task: await updateTaskStatusInDatabase(taskId, status),
    });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Taakstatus bijwerken is mislukt.";
}

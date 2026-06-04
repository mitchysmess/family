import { NextResponse } from "next/server";
import { isRequestAuthenticated } from "@/lib/appSession";
import { deleteProfileFromDatabase } from "@/lib/serverData";

type RouteContext = {
  params: Promise<{
    profileId: string;
  }>;
};

export async function DELETE(request: Request, context: RouteContext) {
  if (!isRequestAuthenticated(request)) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const { profileId } = await context.params;

  if (!profileId) {
    return NextResponse.json(
      { error: "Gezinslid ontbreekt." },
      { status: 400 },
    );
  }

  try {
    await deleteProfileFromDatabase(profileId);
    return NextResponse.json({ success: true });
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
    : "Gezinslid verwijderen is mislukt.";
}

import { NextResponse } from "next/server";
import { isRequestAuthenticated } from "@/lib/appSession";
import {
  createProfileInDatabase,
  getProfilesFromDatabase,
} from "@/lib/serverData";
import type { NewProfileForm } from "@/types/task";

export async function GET(request: Request) {
  if (!isRequestAuthenticated(request)) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  try {
    return NextResponse.json({ profiles: await getProfilesFromDatabase() });
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

  const input = (await request.json().catch(() => null)) as NewProfileForm | null;

  if (!input?.fullName?.trim()) {
    return NextResponse.json(
      { error: "Vul de naam van het gezinslid in." },
      { status: 400 },
    );
  }

  if (input.avatarUrl && !isValidUrl(input.avatarUrl)) {
    return NextResponse.json(
      { error: "Gebruik een geldige foto-URL." },
      { status: 400 },
    );
  }

  if (!/^#[0-9A-Fa-f]{6}$/.test(input.profileColor)) {
    return NextResponse.json(
      { error: "Kies een geldige profielkleur." },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(
      { profile: await createProfileInDatabase(input) },
      { status: 201 },
    );
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
    : "Profielen laden is mislukt.";
}

function isValidUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:";
  } catch {
    return false;
  }
}

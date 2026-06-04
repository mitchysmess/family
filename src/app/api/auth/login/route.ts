import { NextResponse } from "next/server";
import {
  createAppSessionToken,
  getAppSessionCookieHeader,
} from "@/lib/appSession";

export async function POST(request: Request) {
  const { password } = (await request.json().catch(() => ({}))) as {
    password?: string;
  };
  const expectedPassword = process.env.APP_ACCESS_PASSWORD;

  if (!expectedPassword) {
    return NextResponse.json(
      { error: "APP_ACCESS_PASSWORD ontbreekt op de server." },
      { status: 500 },
    );
  }

  if (!password || password !== expectedPassword) {
    return NextResponse.json(
      { error: "Het algemene wachtwoord klopt niet." },
      { status: 401 },
    );
  }

  let sessionToken: string;

  try {
    sessionToken = createAppSessionToken();
  } catch {
    return NextResponse.json(
      { error: "APP_SESSION_SECRET ontbreekt op de server." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { ok: true },
    {
      headers: {
        "Set-Cookie": getAppSessionCookieHeader(sessionToken),
      },
    },
  );
}

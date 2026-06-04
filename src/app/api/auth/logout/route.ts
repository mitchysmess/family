import { NextResponse } from "next/server";
import { getClearAppSessionCookieHeader } from "@/lib/appSession";

export async function POST() {
  return NextResponse.json(
    { ok: true },
    {
      headers: {
        "Set-Cookie": getClearAppSessionCookieHeader(),
      },
    },
  );
}

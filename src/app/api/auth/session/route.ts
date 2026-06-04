import { NextResponse } from "next/server";
import { isRequestAuthenticated } from "@/lib/appSession";

export async function GET(request: Request) {
  return NextResponse.json({ authenticated: isRequestAuthenticated(request) });
}

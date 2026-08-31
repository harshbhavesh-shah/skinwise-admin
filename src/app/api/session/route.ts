import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie, SESSION_COOKIE } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let idToken: string;
  try {
    const body = await req.json();
    idToken = typeof body?.idToken === "string" ? body.idToken : "";
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!idToken) {
    return NextResponse.json({ error: "Missing ID token." }, { status: 400 });
  }

  const result = await createSessionCookie(idToken);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 403 });
  }

  const res = NextResponse.json({ ok: true, email: result.email });
  res.cookies.set(SESSION_COOKIE, result.cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: result.maxAge,
  });
  return res;
}

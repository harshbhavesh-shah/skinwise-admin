import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/admin-auth";
import { addAdmin } from "@/lib/admins";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  if (user.role !== "superadmin") {
    return NextResponse.json({ error: "Only the super admin can add admins." }, { status: 403 });
  }

  let email: string;
  try {
    const body = await req.json();
    email = typeof body?.email === "string" ? body.email.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const record = await addAdmin(email, user.email);
  return NextResponse.json({ admin: record });
}

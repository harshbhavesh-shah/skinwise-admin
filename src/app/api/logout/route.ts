import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { SESSION_COOKIE, getSessionUser } from "@/lib/admin-auth";
import { ensureFirebaseAdmin } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function POST() {
  // Best-effort: revoke the underlying refresh token too, so the session
  // can't be replayed even if the cookie leaked somehow — not just cleared
  // client-side.
  try {
    const user = await getSessionUser();
    if (user) {
      ensureFirebaseAdmin();
      await getAuth().revokeRefreshTokens(user.uid);
    }
  } catch {
    // Non-fatal — clearing the cookie below still logs this browser out.
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}

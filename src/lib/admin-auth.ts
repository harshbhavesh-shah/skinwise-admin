import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import { ensureFirebaseAdmin } from "./firebase-admin";
import { getAdminRecord, type AdminRole } from "./admins";

export const SESSION_COOKIE = "skinwise_admin_session";
// Firebase session cookies can live up to 14 days; matches the cookie's own maxAge below.
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 14;

type SessionResult = { cookie: string; email: string; maxAge: number } | { error: string };

// Exchanges a short-lived Firebase ID token (from the client SDK sign-in)
// for a long-lived, httpOnly session cookie — the standard SSR pattern for
// Firebase Auth. Rejects anyone not in the admins list even if Firebase
// itself authenticated them successfully.
export async function createSessionCookie(idToken: string): Promise<SessionResult> {
  ensureFirebaseAdmin();
  const auth = getAuth();

  let decoded;
  try {
    decoded = await auth.verifyIdToken(idToken);
  } catch {
    return { error: "That sign-in couldn't be verified. Please try again." };
  }

  const record = await getAdminRecord(decoded.email);
  if (!record) {
    return { error: "This account isn't authorized to access the admin panel." };
  }

  const cookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS });
  return { cookie, email: decoded.email!, maxAge: SESSION_MAX_AGE_MS / 1000 };
}

export async function getSessionUser(): Promise<{ email: string; uid: string; role: AdminRole } | null> {
  ensureFirebaseAdmin();
  const store = await cookies();
  const sessionCookie = store.get(SESSION_COOKIE)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await getAuth().verifySessionCookie(sessionCookie, true);
    const record = await getAdminRecord(decoded.email);
    if (!record) return null;
    return { email: decoded.email!, uid: decoded.uid, role: record.role };
  } catch {
    return null;
  }
}

export async function isAdminAuthed(): Promise<boolean> {
  return (await getSessionUser()) !== null;
}

import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import { ensureFirebaseAdmin } from "./firebase-admin";

export const SESSION_COOKIE = "skinwise_admin_session";
// Firebase session cookies can live up to 14 days; matches the cookie's own maxAge below.
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 14;

function getAllowedEmails(): string[] {
  return (process.env.ADMIN_ALLOWED_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailAllowed(email: string | undefined | null): boolean {
  if (!email) return false;
  return getAllowedEmails().includes(email.toLowerCase());
}

type SessionResult = { cookie: string; email: string; maxAge: number } | { error: string };

// Exchanges a short-lived Firebase ID token (from the client SDK sign-in)
// for a long-lived, httpOnly session cookie — the standard SSR pattern for
// Firebase Auth. Rejects anyone not on the allowlist even if Firebase
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

  if (!isEmailAllowed(decoded.email)) {
    return { error: "This account isn't authorized to access the admin panel." };
  }

  const cookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS });
  return { cookie, email: decoded.email!, maxAge: SESSION_MAX_AGE_MS / 1000 };
}

export async function getSessionUser(): Promise<{ email: string; uid: string } | null> {
  ensureFirebaseAdmin();
  const store = await cookies();
  const sessionCookie = store.get(SESSION_COOKIE)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await getAuth().verifySessionCookie(sessionCookie, true);
    if (!isEmailAllowed(decoded.email)) return null;
    return { email: decoded.email!, uid: decoded.uid };
  } catch {
    return null;
  }
}

export async function isAdminAuthed(): Promise<boolean> {
  return (await getSessionUser()) !== null;
}

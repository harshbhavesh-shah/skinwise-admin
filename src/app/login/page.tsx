"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  type User,
} from "firebase/auth";
import { clientAuth } from "@/lib/firebase-client";

async function exchangeForSession(user: User): Promise<{ ok: boolean; error?: string }> {
  const idToken = await user.getIdToken();
  const res = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  const data = await res.json();
  if (!res.ok) {
    // Firebase itself let them sign in, but they're not on the allowlist —
    // don't leave a dangling client-side session for a denied account.
    await clientAuth.signOut();
    return { ok: false, error: data?.error || "Couldn't sign in." };
  }
  return { ok: true };
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"google" | "email" | null>(null);

  const finishLogin = async (user: User) => {
    const result = await exchangeForSession(user);
    if (!result.ok) {
      setError(result.error || "Couldn't sign in.");
      setLoading(null);
      return;
    }
    router.push("/active");
    router.refresh();
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading("google");
    try {
      const credential = await signInWithPopup(clientAuth, new GoogleAuthProvider());
      await finishLogin(credential.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
      setLoading(null);
    }
  };

  const handleEmailPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading("email");
    try {
      const credential = await signInWithEmailAndPassword(clientAuth, email, password);
      await finishLogin(credential.user);
    } catch {
      setError("Incorrect email or password.");
      setLoading(null);
    }
  };

  return (
    <div className="mx-auto flex max-w-sm flex-col px-8 py-28">
      <h1 className="mb-2 text-[26px] font-medium">Admin login</h1>
      <p className="mb-8 text-sm text-ink-soft">Sign in to view and manage orders.</p>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading !== null}
        className="mb-5 flex cursor-pointer items-center justify-center gap-2.5 rounded-full border border-line bg-white py-3 text-[14px] font-medium hover:bg-bg-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4">
          <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
          <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.28V6.63H1.29A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.29 5.37z" />
          <path fill="#EA4335" d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.63l3.98 3.09C6.22 6.88 8.87 4.77 12 4.77z" />
        </svg>
        {loading === "google" ? "Signing in…" : "Continue with Google"}
      </button>

      <div className="mb-5 flex items-center gap-3 text-[12px] text-ink-soft">
        <div className="h-px flex-1 bg-line" />
        or
        <div className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={handleEmailPassword} className="flex flex-col gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Email"
          className="rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Password"
          className="rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent"
        />
        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading !== null}
          className="cursor-pointer rounded-full bg-ink py-3.5 text-[15px] font-semibold text-white hover:bg-[#3a352d] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading === "email" ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

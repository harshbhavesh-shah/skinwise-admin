"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminRecord } from "@/lib/admins";
import { formatDateTime } from "@/lib/format";

export default function ManageAdmins({
  admins,
  currentEmail,
  canManage,
}: {
  admins: AdminRecord[];
  currentEmail: string;
  canManage: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setAdding(true);
    try {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Couldn't add admin.");
        return;
      }
      setEmail("");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (target: string) => {
    setError(null);
    setRemovingEmail(target);
    try {
      const res = await fetch(`/api/admins/${encodeURIComponent(target)}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Couldn't remove admin.");
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setRemovingEmail(null);
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-white p-6">
      <h2 className="mb-1 text-[15px] font-semibold">Admin access</h2>
      <p className="mb-5 text-[13px] text-ink-soft">
        {canManage
          ? "Anyone on this list can sign in and manage orders. Only you can add or remove people."
          : "Anyone on this list can sign in and manage orders. Only the super admin can change this list."}
      </p>

      <div className="mb-5 flex flex-col gap-2.5">
        {admins.map((admin) => (
          <div key={admin.email} className="flex items-center justify-between text-[13.5px]">
            <div>
              <span className="font-medium">{admin.email}</span>
              {admin.email === currentEmail && <span className="ml-2 text-ink-soft">(you)</span>}
              <div className="text-[12px] text-ink-soft">
                {admin.role === "superadmin" ? "Super admin" : "Admin"}
                {admin.role !== "superadmin" && ` · added ${formatDateTime(admin.addedAt)}`}
              </div>
            </div>
            {canManage && admin.role !== "superadmin" && admin.email !== currentEmail && (
              <button
                onClick={() => handleRemove(admin.email)}
                disabled={removingEmail === admin.email}
                className="cursor-pointer rounded-full border border-line px-3.5 py-1.5 text-[12.5px] font-medium hover:bg-bg-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {removingEmail === admin.email ? "Removing…" : "Remove"}
              </button>
            )}
          </div>
        ))}
      </div>

      {canManage && (
        <form onSubmit={handleAdd} className="flex gap-2.5 border-t border-line pt-5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="new-admin@example.com"
            className="flex-1 rounded-lg border border-line bg-white px-3.5 py-2.5 text-[13.5px] outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={adding}
            className="cursor-pointer rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#3a352d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {adding ? "Adding…" : "Add admin"}
          </button>
        </form>
      )}
      {error && <p className="mt-3 text-[13px] text-red-700">{error}</p>}
    </div>
  );
}

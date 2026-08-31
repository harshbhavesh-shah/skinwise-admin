"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUS_TRANSITIONS, type Order, type OrderStatus } from "@/lib/types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  paid: "Paid",
  processing: "Mark as Processing",
  shipped: "Mark as Shipped",
  delivered: "Mark as Delivered",
  cancelled: "Cancel Order",
  refunded: "Mark as Refunded",
};

export default function AdminOrderActions({ order }: { order: Order }) {
  const router = useRouter();
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [note, setNote] = useState("");
  const [notify, setNotify] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailResult, setEmailResult] = useState<boolean | null>(null);

  const [notesDraft, setNotesDraft] = useState(order.adminNotes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  const nextStatuses = ORDER_STATUS_TRANSITIONS[order.status];

  const applyStatus = async (status: OrderStatus) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note: note.trim() || undefined, notify }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Couldn't update the order.");
        setSubmitting(false);
        return;
      }
      setPendingStatus(null);
      setNote("");
      setEmailResult(notify ? Boolean(data.emailSent) : null);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    setNotesSaved(false);
    try {
      await fetch(`/api/orders/${order.id}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesDraft }),
      });
      setNotesSaved(true);
      router.refresh();
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 text-[15px] font-semibold">Update status</h3>
        {emailResult !== null && (
          <p className={`mb-3 text-[12.5px] ${emailResult ? "text-accent" : "text-red-700"}`}>
            {emailResult
              ? "Customer notified by email."
              : "Status updated, but the email couldn't be sent — check email is configured."}
          </p>
        )}
        {nextStatuses.length === 0 ? (
          <p className="text-[13.5px] text-ink-soft">
            This order is in a final state — no further status changes.
          </p>
        ) : pendingStatus ? (
          <div className="flex flex-col gap-3">
            <p className="text-[13.5px]">
              Move this order to <strong className="capitalize">{pendingStatus}</strong>?
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note (e.g. tracking number, reason)"
              rows={2}
              className="rounded-lg border border-line bg-white px-3.5 py-2.5 text-[13.5px] outline-none focus:border-accent"
            />
            <label className="flex items-center gap-2 text-[13px] text-ink-soft">
              <input
                type="checkbox"
                checked={notify}
                onChange={(e) => setNotify(e.target.checked)}
                className="h-3.5 w-3.5"
              />
              Also email the customer
            </label>
            {error && <p className="text-[13px] text-red-700">{error}</p>}
            <div className="flex gap-2.5">
              <button
                onClick={() => applyStatus(pendingStatus)}
                disabled={submitting}
                className="cursor-pointer rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#3a352d] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Saving…" : "Confirm"}
              </button>
              <button
                onClick={() => {
                  setPendingStatus(null);
                  setError(null);
                }}
                className="cursor-pointer rounded-full border border-line px-4 py-2 text-[13px] font-medium hover:bg-bg-2"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {nextStatuses.map((status) => (
              <button
                key={status}
                onClick={() => {
                  setPendingStatus(status);
                  setEmailResult(null);
                }}
                className="cursor-pointer rounded-full border border-line px-4 py-2 text-[13px] font-medium hover:bg-bg-2"
              >
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-[15px] font-semibold">Internal notes</h3>
        <textarea
          value={notesDraft}
          onChange={(e) => {
            setNotesDraft(e.target.value);
            setNotesSaved(false);
          }}
          placeholder="Notes only visible here in the admin panel — not shared with the customer."
          rows={3}
          className="mb-2.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-[13.5px] outline-none focus:border-accent"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={saveNotes}
            disabled={savingNotes}
            className="cursor-pointer rounded-full border border-line px-4 py-2 text-[13px] font-medium hover:bg-bg-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingNotes ? "Saving…" : "Save notes"}
          </button>
          {notesSaved && <span className="text-[12.5px] text-accent">Saved</span>}
        </div>
      </div>
    </div>
  );
}

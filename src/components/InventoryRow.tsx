"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { InventoryItem } from "@/lib/types";

async function patchItem(slug: string, patch: Record<string, unknown>) {
  const res = await fetch(`/api/inventory/${encodeURIComponent(slug)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Couldn't save.");
}

export default function InventoryRow({ item }: { item: InventoryItem }) {
  const router = useRouter();
  const [sku, setSku] = useState(item.sku);
  const [quantity, setQuantity] = useState(item.quantity === null ? "" : String(item.quantity));
  const [discount, setDiscount] = useState(String(item.discountPercent));
  const [nextOrderDate, setNextOrderDate] = useState(item.nextOrderDate ?? "");
  const [error, setError] = useState<string | null>(null);
  const [savedField, setSavedField] = useState<string | null>(null);

  const flashSaved = (field: string) => {
    setSavedField(field);
    setTimeout(() => setSavedField((f) => (f === field ? null : f)), 1200);
  };

  const handleBlur = async (field: string, value: unknown) => {
    setError(null);
    try {
      await patchItem(item.slug, { [field]: value });
      flashSaved(field);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save.");
    }
  };

  const inputClass =
    "w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-accent";

  return (
    <div className="grid grid-cols-[2fr_1fr_0.8fr_0.8fr_1fr] items-center gap-3 border-b border-line px-1 py-3 text-[13.5px] last:border-b-0">
      <div className="truncate pr-2">{item.name}</div>

      <div>
        <input
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          onBlur={() => handleBlur("sku", sku)}
          placeholder="—"
          className={inputClass}
        />
      </div>

      <div>
        <input
          type="number"
          min={0}
          step={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          onBlur={() =>
            handleBlur("quantity", quantity.trim() === "" ? null : Math.max(0, Math.round(Number(quantity))))
          }
          placeholder="Untracked"
          className={inputClass}
        />
      </div>

      <div className="flex items-center gap-1">
        <input
          type="number"
          min={0}
          max={100}
          step={1}
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          onBlur={() => handleBlur("discountPercent", Math.min(100, Math.max(0, Number(discount) || 0)))}
          className={inputClass}
        />
        <span className="text-ink-soft">%</span>
      </div>

      <div>
        <input
          type="date"
          value={nextOrderDate}
          onChange={(e) => setNextOrderDate(e.target.value)}
          onBlur={() => handleBlur("nextOrderDate", nextOrderDate || null)}
          className={inputClass}
        />
      </div>

      {(error || savedField) && (
        <div className="col-span-5 -mt-1 text-[11.5px]">
          {error ? <span className="text-red-700">{error}</span> : <span className="text-accent">Saved</span>}
        </div>
      )}
    </div>
  );
}

import { listInventory } from "@/lib/inventory";
import type { InventoryItem } from "@/lib/types";
import InventoryRow from "@/components/InventoryRow";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  let byBrand: Map<string, InventoryItem[]>;
  let loadError: string | null = null;
  try {
    byBrand = await listInventory();
  } catch (err) {
    byBrand = new Map();
    loadError = err instanceof Error ? err.message : "Couldn't load inventory.";
  }

  return (
    <div className="mx-auto max-w-6xl px-8 py-14">
      <div className="mb-8">
        <h1 className="text-[28px] font-medium">Products</h1>
        <p className="text-sm text-ink-soft">
          Stock, discounts, and reorder dates — quantity and discount apply live on the storefront.
        </p>
      </div>

      {loadError ? (
        <p className="rounded-2xl border border-line bg-red-50 p-8 text-center text-red-700">{loadError}</p>
      ) : (
        <div className="flex flex-col gap-8">
          {Array.from(byBrand.entries()).map(([brand, items]) => (
            <section key={brand} className="rounded-2xl border border-line bg-white p-6">
              <h2 className="mb-4 text-[17px] font-semibold">{brand}</h2>
              <div className="grid grid-cols-[2fr_1fr_0.8fr_0.8fr_1fr] gap-3 border-b border-line px-1 pb-2.5 text-[11.5px] font-medium uppercase tracking-[0.5px] text-ink-soft">
                <div>Name</div>
                <div>SKU</div>
                <div>Quantity</div>
                <div>Discount</div>
                <div>Next order date</div>
              </div>
              {items.map((item) => (
                <InventoryRow key={item.slug} item={item} />
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

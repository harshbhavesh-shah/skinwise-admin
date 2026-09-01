import { getDb } from "./db";
import { CATALOG_SEED } from "./catalog-seed";
import type { InventoryItem } from "./types";

const INVENTORY_COLLECTION = "inventory";

function toInventoryItem(id: string, data: FirebaseFirestore.DocumentData): InventoryItem {
  return {
    slug: id,
    brand: String(data.brand),
    name: String(data.name),
    sku: typeof data.sku === "string" ? data.sku : "",
    quantity: typeof data.quantity === "number" ? data.quantity : null,
    discountPercent: typeof data.discountPercent === "number" ? data.discountPercent : 0,
    nextOrderDate: typeof data.nextOrderDate === "string" ? data.nextOrderDate : null,
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : new Date(0).toISOString(),
  };
}

// Reads the inventory collection and self-heals: any catalog product
// without a Firestore doc yet gets one created with safe defaults (quantity
// null = untracked/unlimited, so this can never accidentally take products
// off-sale). Also covers a product added to the storefront catalog later —
// just add it to catalog-seed.ts and it appears here on next load.
export async function listInventory(): Promise<Map<string, InventoryItem[]>> {
  const db = getDb();
  const snapshot = await db.collection(INVENTORY_COLLECTION).get();
  const existing = new Map(snapshot.docs.map((doc) => [doc.id, toInventoryItem(doc.id, doc.data())]));

  const missing = CATALOG_SEED.filter((entry) => !existing.has(entry.slug));
  if (missing.length > 0) {
    const batch = db.batch();
    const now = new Date().toISOString();
    for (const entry of missing) {
      const item: InventoryItem = {
        slug: entry.slug,
        brand: entry.brand,
        name: entry.name,
        sku: "",
        quantity: null,
        discountPercent: 0,
        nextOrderDate: null,
        updatedAt: now,
      };
      batch.set(db.collection(INVENTORY_COLLECTION).doc(entry.slug), item);
      existing.set(entry.slug, item);
    }
    await batch.commit();
  }

  const byBrand = new Map<string, InventoryItem[]>();
  // Iterate the seed list first so brand/product ordering matches the
  // storefront catalog rather than Firestore's arbitrary doc order.
  for (const entry of CATALOG_SEED) {
    const item = existing.get(entry.slug);
    if (!item) continue;
    const list = byBrand.get(item.brand) ?? [];
    list.push(item);
    byBrand.set(item.brand, list);
  }
  return byBrand;
}

export type InventoryPatch = Partial<
  Pick<InventoryItem, "sku" | "quantity" | "discountPercent" | "nextOrderDate">
>;

export async function updateInventoryItem(slug: string, patch: InventoryPatch): Promise<void> {
  if (patch.quantity !== undefined && patch.quantity !== null) {
    if (!Number.isInteger(patch.quantity) || patch.quantity < 0) {
      throw new Error("Quantity must be a whole number of 0 or more.");
    }
  }
  if (patch.discountPercent !== undefined) {
    if (!Number.isFinite(patch.discountPercent) || patch.discountPercent < 0 || patch.discountPercent > 100) {
      throw new Error("Discount must be between 0 and 100.");
    }
  }
  if (patch.nextOrderDate !== undefined && patch.nextOrderDate !== null) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(patch.nextOrderDate)) {
      throw new Error("Invalid date.");
    }
  }

  const db = getDb();
  await db
    .collection(INVENTORY_COLLECTION)
    .doc(slug)
    .set({ ...patch, updatedAt: new Date().toISOString() }, { merge: true });
}

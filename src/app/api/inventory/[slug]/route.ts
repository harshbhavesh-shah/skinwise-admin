import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { updateInventoryItem, type InventoryPatch } from "@/lib/inventory";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { slug } = await params;

  let body: { sku?: string; quantity?: number | null; discountPercent?: number; nextOrderDate?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const patch: InventoryPatch = {};
  if (body.sku !== undefined) patch.sku = body.sku;
  if (body.quantity !== undefined) patch.quantity = body.quantity;
  if (body.discountPercent !== undefined) patch.discountPercent = body.discountPercent;
  if (body.nextOrderDate !== undefined) patch.nextOrderDate = body.nextOrderDate;

  try {
    await updateInventoryItem(slug, patch);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Couldn't update inventory.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

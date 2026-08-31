import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { appendEmailLog, updateOrderStatus } from "@/lib/orders";
import { buildStatusUpdateEmail, sendEmail } from "@/lib/email";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";

export const runtime = "nodejs";

const VALID_STATUSES = new Set<string>(ORDER_STATUSES);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { id } = await params;

  let body: { status?: string; note?: string; notify?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.status || !VALID_STATUSES.has(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  try {
    const note = body.note?.trim() || undefined;
    const order = await updateOrderStatus(id, body.status as OrderStatus, note);

    let emailSent = false;
    if (body.notify) {
      const { subject, html } = buildStatusUpdateEmail(order, order.status, note);
      const result = await sendEmail(order.customer.email, subject, html);
      if (result.sent) {
        await appendEmailLog(order.id, subject);
        emailSent = true;
      }
    }

    return NextResponse.json({ order, emailSent });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Couldn't update order status.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

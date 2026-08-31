import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { isAdminAuthed } from "@/lib/admin-auth";
import { getOrder } from "@/lib/orders";
import { OrderReceiptDocument } from "@/lib/receipt";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { id } = await params;
  const order = await getOrder(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const buffer = await renderToBuffer(OrderReceiptDocument({ order }));

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="skinwise-receipt-${order.razorpayPaymentId}.pdf"`,
    },
  });
}

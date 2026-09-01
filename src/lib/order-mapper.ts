import type { Timestamp } from "firebase-admin/firestore";
import type {
  CustomerInfo,
  EmailLogEntry,
  Order,
  OrderItem,
  OrderStatus,
  OrderStatusEvent,
} from "./types";

export function docToOrder(id: string, data: FirebaseFirestore.DocumentData): Order {
  const createdAt = data.createdAt as Timestamp | undefined;
  return {
    id,
    createdAt: createdAt ? createdAt.toDate().toISOString() : new Date().toISOString(),
    razorpayOrderId: String(data.razorpayOrderId),
    razorpayPaymentId: String(data.razorpayPaymentId),
    status: data.status as OrderStatus,
    statusHistory: ((data.statusHistory as OrderStatusEvent[] | undefined) ?? []).slice()
      .sort((a, b) => a.at.localeCompare(b.at)),
    adminNotes: typeof data.adminNotes === "string" ? data.adminNotes : undefined,
    emailLog: (data.emailLog as EmailLogEntry[] | undefined) ?? [],
    customer: data.customer as CustomerInfo,
    customerUid: typeof data.customerUid === "string" ? data.customerUid : undefined,
    pointsEarned: typeof data.pointsEarned === "number" ? data.pointsEarned : undefined,
    pointsRedeemed: typeof data.pointsRedeemed === "number" ? data.pointsRedeemed : undefined,
    subtotal: Number(data.subtotal),
    shipping: Number(data.shipping),
    total: Number(data.total),
    items: data.items as OrderItem[],
  };
}

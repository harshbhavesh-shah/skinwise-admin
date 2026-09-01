import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getDb } from "./db";
import { docToOrder } from "./order-mapper";
import {
  ORDER_STATUS_TRANSITIONS,
  type EmailLogEntry,
  type Order,
  type OrderStatus,
  type OrderStatusEvent,
} from "./types";

const ORDERS_COLLECTION = "orders";

const PAGE_SIZE = 20;
// Firestore can't do substring search, and combining a status equality
// filter with the createdAt ordering needs a composite index we haven't
// created. So when either filter is active, pull a bounded recent window
// (ordered/date-ranged server-side, which needs no extra index since it's
// all on the same createdAt field) and filter + paginate it in memory.
// Fine at this store's order volume — revisit with a real search index
// (e.g. Algolia) if it grows much past this.
const SEARCH_WINDOW = 300;

export type ListOrdersOptions = {
  status?: OrderStatus;
  excludeStatuses?: OrderStatus[];
  q?: string;
  from?: string; // "YYYY-MM-DD"
  to?: string; // "YYYY-MM-DD"
  cursor?: string; // createdAt (ISO) of the last order on the previous page
};

export async function listOrders(
  opts: ListOrdersOptions = {}
): Promise<{ orders: Order[]; nextCursor: string | null }> {
  const db = getDb();
  let query: FirebaseFirestore.Query = db
    .collection(ORDERS_COLLECTION)
    .orderBy("createdAt", "desc");

  if (opts.from) {
    query = query.where("createdAt", ">=", Timestamp.fromDate(new Date(`${opts.from}T00:00:00.000Z`)));
  }
  if (opts.to) {
    query = query.where("createdAt", "<=", Timestamp.fromDate(new Date(`${opts.to}T23:59:59.999Z`)));
  }

  const needsInMemoryFilter = Boolean(opts.status || opts.q || opts.excludeStatuses?.length);

  if (!needsInMemoryFilter) {
    if (opts.cursor) {
      query = query.startAfter(Timestamp.fromDate(new Date(opts.cursor)));
    }
    const snapshot = await query.limit(PAGE_SIZE + 1).get();
    const orders = snapshot.docs.slice(0, PAGE_SIZE).map((doc) => docToOrder(doc.id, doc.data()));
    const nextCursor =
      snapshot.docs.length > PAGE_SIZE ? orders[orders.length - 1]?.createdAt ?? null : null;
    return { orders, nextCursor };
  }

  const snapshot = await query.limit(SEARCH_WINDOW).get();
  let matches = snapshot.docs.map((doc) => docToOrder(doc.id, doc.data()));

  if (opts.status) {
    matches = matches.filter((o) => o.status === opts.status);
  }
  if (opts.excludeStatuses?.length) {
    matches = matches.filter((o) => !opts.excludeStatuses!.includes(o.status));
  }
  if (opts.q) {
    const q = opts.q.trim().toLowerCase();
    matches = matches.filter((o) =>
      [
        o.customer.firstName,
        o.customer.lastName,
        o.customer.email,
        o.customer.phone,
        o.razorpayOrderId,
        o.razorpayPaymentId,
      ].some((field) => field.toLowerCase().includes(q))
    );
  }

  const startIndex = opts.cursor ? matches.findIndex((o) => o.createdAt === opts.cursor) + 1 : 0;
  const page = matches.slice(startIndex, startIndex + PAGE_SIZE);
  const nextCursor =
    startIndex + PAGE_SIZE < matches.length ? page[page.length - 1]?.createdAt ?? null : null;

  return { orders: page, nextCursor };
}

export async function getOrder(id: string): Promise<Order | null> {
  const db = getDb();
  const doc = await db.collection(ORDERS_COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return docToOrder(doc.id, doc.data()!);
}

export async function updateOrderStatus(
  id: string,
  nextStatus: OrderStatus,
  note?: string
): Promise<Order> {
  const db = getDb();
  const ref = db.collection(ORDERS_COLLECTION).doc(id);

  const order = await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    if (!doc.exists) throw new Error("Order not found.");
    const current = docToOrder(doc.id, doc.data()!);

    const allowed = ORDER_STATUS_TRANSITIONS[current.status];
    if (!allowed.includes(nextStatus)) {
      throw new Error(`Can't move an order from "${current.status}" to "${nextStatus}".`);
    }

    const event: OrderStatusEvent = {
      status: nextStatus,
      at: new Date().toISOString(),
      ...(note ? { note } : {}),
    };

    tx.update(ref, {
      status: nextStatus,
      statusHistory: FieldValue.arrayUnion(event),
    });

    return { ...current, status: nextStatus, statusHistory: [...current.statusHistory, event] };
  });

  return order;
}

export async function updateOrderNotes(id: string, adminNotes: string): Promise<void> {
  const db = getDb();
  await db.collection(ORDERS_COLLECTION).doc(id).update({ adminNotes });
}

export async function appendEmailLog(id: string, subject: string): Promise<void> {
  const db = getDb();
  const entry: EmailLogEntry = { subject, at: new Date().toISOString() };
  await db
    .collection(ORDERS_COLLECTION)
    .doc(id)
    .update({ emailLog: FieldValue.arrayUnion(entry) });
}

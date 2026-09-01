import { getDb } from "./db";
import type { Order, OrderStatus } from "./types";
import { docToOrder } from "./order-mapper";

const ORDERS_COLLECTION = "orders";
// Same reasoning as the SEARCH_WINDOW cap in orders.ts — fine to pull the
// whole collection into memory at this store's order volume. Revisit with
// real aggregation queries if it grows much past this.
const MAX_ORDERS = 5000;
const REVENUE_BY_DAY_WINDOW = 14;

export type AnalyticsSummary = {
  orderCount: number;
  grossRevenue: number;
  avgOrderValue: number;
  byStatus: { status: OrderStatus; count: number; revenue: number }[];
  revenueByDay: { date: string; revenue: number; count: number }[];
  topProducts: { slug: string; name: string; brand: string; qty: number; revenue: number }[];
};

function dayKey(iso: string): string {
  return iso.slice(0, 10); // "YYYY-MM-DD"
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const db = getDb();
  const snapshot = await db
    .collection(ORDERS_COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(MAX_ORDERS)
    .get();

  const orders: Order[] = snapshot.docs.map((doc) => docToOrder(doc.id, doc.data()));

  const orderCount = orders.length;
  const grossRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = orderCount > 0 ? grossRevenue / orderCount : 0;

  const statusMap = new Map<OrderStatus, { count: number; revenue: number }>();
  for (const order of orders) {
    const entry = statusMap.get(order.status) ?? { count: 0, revenue: 0 };
    entry.count += 1;
    entry.revenue += order.total;
    statusMap.set(order.status, entry);
  }
  const byStatus = Array.from(statusMap.entries())
    .map(([status, v]) => ({ status, ...v }))
    .sort((a, b) => b.revenue - a.revenue);

  // Trailing N-day window, zero-filled so gaps in the data still render as
  // flat bars instead of a misleadingly short list.
  const dayMap = new Map<string, { revenue: number; count: number }>();
  for (const order of orders) {
    const key = dayKey(order.createdAt);
    const entry = dayMap.get(key) ?? { revenue: 0, count: 0 };
    entry.revenue += order.total;
    entry.count += 1;
    dayMap.set(key, entry);
  }
  const revenueByDay: AnalyticsSummary["revenueByDay"] = [];
  for (let i = REVENUE_BY_DAY_WINDOW - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    const entry = dayMap.get(key) ?? { revenue: 0, count: 0 };
    revenueByDay.push({ date: key, ...entry });
  }

  const productMap = new Map<
    string,
    { slug: string; name: string; brand: string; qty: number; revenue: number }
  >();
  for (const order of orders) {
    for (const item of order.items) {
      const entry = productMap.get(item.slug) ?? {
        slug: item.slug,
        name: item.name,
        brand: item.brand,
        qty: 0,
        revenue: 0,
      };
      entry.qty += item.qty;
      entry.revenue += item.price * item.qty;
      productMap.set(item.slug, entry);
    }
  }
  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 8);

  return { orderCount, grossRevenue, avgOrderValue, byStatus, revenueByDay, topProducts };
}

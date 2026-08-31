import Link from "next/link";
import { listOrders } from "@/lib/orders";
import type { Order } from "@/lib/types";
import OrderCard from "@/components/OrderCard";

export const dynamic = "force-dynamic";

const FINAL_STATUSES = ["delivered", "cancelled", "refunded"] as const;

export default async function ActiveOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>;
}) {
  const { cursor } = await searchParams;

  let orders: Order[] = [];
  let nextCursor: string | null = null;
  let loadError: string | null = null;
  try {
    const result = await listOrders({
      excludeStatuses: [...FINAL_STATUSES],
      cursor,
    });
    orders = result.orders;
    nextCursor = result.nextCursor;
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Couldn't load orders.";
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-6xl px-8 py-14">
        <h1 className="mb-8 text-[28px] font-medium">Active Orders</h1>
        <p className="rounded-2xl border border-line bg-red-50 p-8 text-center text-red-700">
          {loadError}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-8 py-14">
      <div className="mb-8">
        <h1 className="text-[28px] font-medium">Active Orders</h1>
        <p className="text-sm text-ink-soft">
          {orders.length} order{orders.length === 1 ? "" : "s"} in progress
        </p>
      </div>

      {orders.length === 0 ? (
        <p className="rounded-2xl border border-line bg-white p-8 text-center text-ink-soft">
          Nothing needs attention right now — every order is delivered, cancelled, or refunded.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>

          {nextCursor && (
            <div className="mt-8 text-center">
              <Link
                href={`/active?cursor=${encodeURIComponent(nextCursor)}`}
                className="inline-block rounded-full border border-line px-5 py-2.5 text-[13px] font-medium hover:bg-bg-2"
              >
                Load more
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

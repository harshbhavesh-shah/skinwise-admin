import Link from "next/link";
import { listOrders } from "@/lib/orders";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/types";
import { formatDateTime, formatPrice } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

type SearchParams = {
  status?: string;
  q?: string;
  from?: string;
  to?: string;
  cursor?: string;
};

function buildQuery(params: SearchParams, overrides: Partial<SearchParams>) {
  const merged = { ...params, ...overrides };
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value) sp.set(key, value);
  }
  const qs = sp.toString();
  return qs ? `/orders?${qs}` : "/orders";
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const status = (ORDER_STATUSES as readonly string[]).includes(params.status ?? "")
    ? (params.status as OrderStatus)
    : undefined;

  let orders: Order[] = [];
  let nextCursor: string | null = null;
  let loadError: string | null = null;
  try {
    const result = await listOrders({
      status,
      q: params.q,
      from: params.from,
      to: params.to,
      cursor: params.cursor,
    });
    orders = result.orders;
    nextCursor = result.nextCursor;
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Couldn't load orders.";
  }

  const hasFilters = Boolean(params.status || params.q || params.from || params.to);

  if (loadError) {
    return (
      <div className="mx-auto max-w-6xl px-8 py-14">
        <h1 className="mb-8 text-[28px] font-medium">Orders</h1>
        <p className="rounded-2xl border border-line bg-red-50 p-8 text-center text-red-700">
          {loadError}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-8 py-14">
      <div className="mb-8">
        <h1 className="text-[28px] font-medium">Orders</h1>
        <p className="text-sm text-ink-soft">
          {orders.length} order{orders.length === 1 ? "" : "s"} shown
        </p>
      </div>

      <form className="mb-8 flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-white p-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-ink-soft">Search</label>
          <input
            type="text"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Name, email, phone, order ID…"
            className="w-56 rounded-lg border border-line bg-white px-3 py-2 text-[13.5px] outline-none focus:border-accent"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-ink-soft">Status</label>
          <select
            name="status"
            defaultValue={params.status ?? ""}
            className="rounded-lg border border-line bg-white px-3 py-2 text-[13.5px] capitalize outline-none focus:border-accent"
          >
            <option value="">All</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-ink-soft">From</label>
          <input
            type="date"
            name="from"
            defaultValue={params.from ?? ""}
            className="rounded-lg border border-line bg-white px-3 py-2 text-[13.5px] outline-none focus:border-accent"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-ink-soft">To</label>
          <input
            type="date"
            name="to"
            defaultValue={params.to ?? ""}
            className="rounded-lg border border-line bg-white px-3 py-2 text-[13.5px] outline-none focus:border-accent"
          />
        </div>
        <button
          type="submit"
          className="cursor-pointer rounded-full bg-ink px-5 py-2 text-[13px] font-semibold text-white hover:bg-[#3a352d]"
        >
          Filter
        </button>
        {hasFilters && (
          <Link href="/orders" className="text-[13px] text-ink-soft hover:text-ink">
            Clear filters
          </Link>
        )}
      </form>

      {orders.length === 0 ? (
        <p className="rounded-2xl border border-line bg-white p-8 text-center text-ink-soft">
          {hasFilters ? "No orders match these filters." : "No orders yet."}
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block rounded-2xl border border-line bg-white p-6 transition-colors hover:border-accent"
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
                  <div>
                    <div className="text-[15px] font-medium">
                      {order.customer.firstName} {order.customer.lastName}
                    </div>
                    <div className="text-[13px] text-ink-soft">
                      {order.customer.email} &middot; {order.customer.phone}
                    </div>
                    <div className="mt-1 text-[13px] text-ink-soft">
                      {order.customer.address}, {order.customer.city}, {order.customer.state}{" "}
                      {order.customer.pincode}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[15px] font-semibold">{formatPrice(order.total)}</div>
                    <div className="text-[12.5px] text-ink-soft">{formatDateTime(order.createdAt)}</div>
                    <StatusBadge status={order.status} className="mt-1" />
                  </div>
                </div>

                <div className="mb-3 flex flex-col gap-1.5">
                  {order.items.map((item) => (
                    <div key={item.slug} className="flex justify-between text-[13.5px]">
                      <span className="text-ink-soft">
                        {item.brand} {item.name} &times; {item.qty}
                      </span>
                      <span>{formatPrice(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11.5px] text-ink-soft">
                  <span>Payment ID: {order.razorpayPaymentId}</span>
                  <span>Order ID: {order.razorpayOrderId}</span>
                </div>
              </Link>
            ))}
          </div>

          {nextCursor && (
            <div className="mt-8 text-center">
              <Link
                href={buildQuery(params, { cursor: nextCursor })}
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

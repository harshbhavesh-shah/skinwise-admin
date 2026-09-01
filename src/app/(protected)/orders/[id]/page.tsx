import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrder } from "@/lib/orders";
import { formatDateTime, formatPrice } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import AdminOrderActions from "@/components/AdminOrderActions";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-5xl px-8 py-14">
      <Link href="/orders" className="mb-6 inline-block text-[13px] text-ink-soft hover:text-ink">
        &larr; All orders
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-medium">
            {order.customer.firstName} {order.customer.lastName}
          </h1>
          <p className="text-sm text-ink-soft">{formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/api/orders/${order.id}/receipt`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-line px-4 py-1.5 text-[13px] font-medium hover:bg-bg-2"
          >
            Download receipt
          </a>
          <StatusBadge status={order.status} className="!text-[13px] !px-3 !py-1" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-8">
          <section className="rounded-2xl border border-line bg-white p-6">
            <h2 className="mb-4 text-[15px] font-semibold">Items</h2>
            <div className="flex flex-col gap-2.5">
              {order.items.map((item) => (
                <div key={item.slug} className="flex justify-between text-[13.5px]">
                  <span className="text-ink-soft">
                    {item.brand} {item.name} &times; {item.qty}
                  </span>
                  <span>{formatPrice(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-1.5 border-t border-line pt-4 text-[13.5px]">
              <div className="flex justify-between text-ink-soft">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-ink-soft">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between text-[15px] font-semibold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              {Boolean(order.pointsRedeemed) && (
                <div className="flex justify-between text-accent">
                  <span>Points redeemed</span>
                  <span>{order.pointsRedeemed} pts</span>
                </div>
              )}
              {Boolean(order.pointsEarned) && (
                <div className="flex justify-between text-accent">
                  <span>Points earned</span>
                  <span>+{order.pointsEarned} pts</span>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-6">
            <h2 className="mb-4 text-[15px] font-semibold">Customer &amp; shipping</h2>
            <div className="flex flex-col gap-1 text-[13.5px]">
              <div>{order.customer.email}</div>
              <div>{order.customer.phone}</div>
              <div className="mt-2 text-ink-soft">
                {order.customer.address}
                <br />
                {order.customer.city}, {order.customer.state} {order.customer.pincode}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-6">
            <h2 className="mb-4 text-[15px] font-semibold">Status history</h2>
            <div className="flex flex-col gap-4">
              {order.statusHistory.map((event, i) => (
                <div key={i} className="flex gap-3">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                  <div>
                    <div className="text-[13.5px] font-medium capitalize">{event.status}</div>
                    <div className="text-[12px] text-ink-soft">{formatDateTime(event.at)}</div>
                    {event.note && <div className="mt-1 text-[13px] text-ink-soft">{event.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {order.emailLog.length > 0 && (
            <section className="rounded-2xl border border-line bg-white p-6">
              <h2 className="mb-4 text-[15px] font-semibold">Emails sent</h2>
              <div className="flex flex-col gap-2.5">
                {order.emailLog.map((entry, i) => (
                  <div key={i} className="flex justify-between text-[13px]">
                    <span>{entry.subject}</span>
                    <span className="text-ink-soft">{formatDateTime(entry.at)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="flex flex-wrap gap-x-6 gap-y-1 text-[11.5px] text-ink-soft">
            <span>Payment ID: {order.razorpayPaymentId}</span>
            <span>Order ID: {order.razorpayOrderId}</span>
          </section>
        </div>

        <div className="h-fit rounded-2xl border border-line bg-white p-6">
          <AdminOrderActions order={order} />
        </div>
      </div>
    </div>
  );
}

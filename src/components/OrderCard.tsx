import Link from "next/link";
import type { Order } from "@/lib/types";
import { formatDateTime, formatPrice } from "@/lib/format";
import StatusBadge from "./StatusBadge";

export default function OrderCard({ order }: { order: Order }) {
  return (
    <Link
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
  );
}

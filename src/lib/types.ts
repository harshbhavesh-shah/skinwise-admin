export type CustomerInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

export type OrderItem = {
  slug: string;
  name: string;
  brand: string;
  qty: number;
  price: number;
};

export const ORDER_STATUSES = [
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

// Which statuses an order can move to next from a given status — drives
// which action buttons the order detail page shows.
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  paid: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "refunded"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

export type OrderStatusEvent = {
  status: OrderStatus;
  at: string;
  note?: string;
};

export type EmailLogEntry = {
  at: string;
  subject: string;
};

export type Order = {
  id: string;
  createdAt: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  status: OrderStatus;
  statusHistory: OrderStatusEvent[];
  adminNotes?: string;
  emailLog: EmailLogEntry[];
  customer: CustomerInfo;
  // Set when checkout happened while signed into a customer account on the
  // storefront. Absent for guest checkouts.
  customerUid?: string;
  // Loyalty points this order earned/redeemed — absent for guest checkouts
  // or accounts with no points activity on this order.
  pointsEarned?: number;
  pointsRedeemed?: number;
  subtotal: number;
  shipping: number;
  total: number;
  items: OrderItem[];
};

export type InventoryItem = {
  slug: string;
  brand: string;
  name: string;
  sku: string;
  // null = not being stock-tracked yet — the storefront treats this as
  // always available. Only a real number enforces stock/checkout limits.
  quantity: number | null;
  discountPercent: number;
  // "YYYY-MM-DD", purely an internal restocking reminder — never shown to
  // customers on the storefront.
  nextOrderDate: string | null;
  updatedAt: string;
};

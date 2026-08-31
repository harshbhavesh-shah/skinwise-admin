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
  subtotal: number;
  shipping: number;
  total: number;
  items: OrderItem[];
};

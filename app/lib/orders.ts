export type OrderStatus =
  | "Order Placed"
  | "Processing"
  | "Packed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export type OrderItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
};

export type Order = {
  orderId: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  shippingAddress: string;
  paymentMethod: string;
  email: string;
  name: string;
};

export const ORDER_STATUSES: OrderStatus[] = [
  "Order Placed",
  "Processing",
  "Packed",
  "Shipped",
  "Delivered",
];

export const STATUS_META: Record<
  OrderStatus,
  { icon: string; className: string }
> = {
  "Order Placed": { icon: "🔵", className: "placed" },
  Processing: { icon: "🟡", className: "processing" },
  Packed: { icon: "🟠", className: "packed" },
  Shipped: { icon: "🚚", className: "shipped" },
  Delivered: { icon: "🟢", className: "delivered" },
  Cancelled: { icon: "❌", className: "cancelled" },
};

const ORDERS_KEY = "velora-orders";

export function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === "string" &&
    (value === "Cancelled" || ORDER_STATUSES.includes(value as OrderStatus))
  );
}

export function formatOrderDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function normalizeOrder(raw: unknown): Order {
  const r = (raw ?? {}) as Record<string, unknown>;
  const items = Array.isArray(r.items)
    ? (r.items as Array<Record<string, unknown>>).map((item) => ({
        id: Number(item.id ?? 0),
        name: String(item.name ?? "Item"),
        price: Number(item.price ?? 0),
        qty: Number(item.qty ?? 1),
      }))
    : [];
  const legacyNumber = String(r.number ?? "");
  const addressParts = [
    String(r.address ?? ""),
    String(r.city ?? ""),
    String(r.postal ?? ""),
    String(r.country ?? ""),
  ].filter(Boolean);
  return {
    orderId: legacyNumber || String(r.orderId ?? ""),
    date: String(r.date ?? new Date().toISOString()),
    status: isOrderStatus(r.status) ? r.status : "Order Placed",
    total: Number(r.total ?? 0),
    items,
    shippingAddress: String(r.shippingAddress ?? addressParts.join(", ")),
    paymentMethod: String(r.paymentMethod ?? "Card"),
    email: String(r.email ?? ""),
    name: String(r.name ?? ""),
  };
}

export function readOrders(): Order[] {
  try {
    const stored = window.localStorage.getItem(ORDERS_KEY);
    const parsed = stored ? (JSON.parse(stored) as unknown[]) : [];
    return Array.isArray(parsed) ? parsed.map(normalizeOrder) : [];
  } catch {
    return [];
  }
}

export function saveOrder(order: Order): void {
  try {
    const orders = readOrders();
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...orders]));
  } catch {
    // ignore storage errors
  }
}

export function generateOrderId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 6; i += 1) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return `VLR-${id}`;
}

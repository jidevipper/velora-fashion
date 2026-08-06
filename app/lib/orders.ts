import { getSupabase } from "@/app/lib/supabase";

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
  return readLocalOrders();
}

export function saveOrder(order: Order): void {
  saveLocalOrder(order);
}

type OrderRow = {
  id: string;
  order_id: string;
  status: string;
  total: number;
  items: unknown;
  shipping_address: string;
  payment_method: string;
  email: string;
  name: string;
  date: string;
};

function rowToOrder(row: OrderRow): Order {
  return {
    orderId: row.order_id,
    date: row.date,
    status: isOrderStatus(row.status) ? row.status : "Order Placed",
    total: Number(row.total),
    items: Array.isArray(row.items) ? (row.items as OrderItem[]) : [],
    shippingAddress: row.shipping_address,
    paymentMethod: row.payment_method,
    email: row.email,
    name: row.name,
  };
}

function readLocalOrders(): Order[] {
  try {
    const stored = window.localStorage.getItem(ORDERS_KEY);
    const parsed = stored ? (JSON.parse(stored) as unknown[]) : [];
    return Array.isArray(parsed) ? parsed.map(normalizeOrder) : [];
  } catch {
    return [];
  }
}

function saveLocalOrder(order: Order): void {
  try {
    const orders = readLocalOrders();
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...orders]));
  } catch {
    // ignore storage errors
  }
}

/** Save an order to the Supabase database (falls back to localStorage). */
export async function saveOrderToDb(
  order: Order,
  userId?: string
): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from("orders").insert({
      user_id: userId || null,
      order_id: order.orderId,
      status: order.status,
      total: order.total,
      items: order.items,
      shipping_address: order.shippingAddress,
      payment_method: order.paymentMethod,
      email: order.email,
      name: order.name,
      date: order.date,
    });
    if (!error) return true;
  }
  saveLocalOrder(order);
  return false;
}

/** Read the user's orders: database first, merged with local copies. */
export async function readOrdersFromDb(): Promise<Order[]> {
  const local = readLocalOrders();
  const supabase = getSupabase();
  if (!supabase) return local;

  let rows: OrderRow[] = [];
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("date", { ascending: false });
    if (!error && data) rows = data as OrderRow[];
  } catch {
    rows = [];
  }

  const merged = new Map<string, Order>();
  for (const order of [...rows.map(rowToOrder), ...local]) {
    merged.set(order.orderId, order);
  }
  return Array.from(merged.values());
}

export function generateOrderId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 6; i += 1) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return `VLR-${id}`;
}

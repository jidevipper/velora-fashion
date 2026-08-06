"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import {
  ORDER_STATUSES,
  STATUS_META,
  formatOrderDate,
  readOrders,
  type Order,
  type OrderStatus,
} from "@/app/lib/orders";
import "./orders.css";

function StatusBadge({ status }: { status: OrderStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={`order-status ${meta.className}`}>
      {meta.icon} {status}
    </span>
  );
}

function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "Cancelled") {
    return (
      <div className="track-steps cancelled">
        <div className="track-step done">
          <span className="track-dot">❌</span>
          <span className="track-label">Order Cancelled</span>
        </div>
      </div>
    );
  }
  const current = ORDER_STATUSES.indexOf(status);
  return (
    <div className="track-steps">
      {ORDER_STATUSES.map((step, index) => (
        <div
          className={`track-step${index <= current ? " done" : ""}`}
          key={step}
        >
          <span className="track-dot">{STATUS_META[step].icon}</span>
          <span className="track-label">{step}</span>
        </div>
      ))}
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const { addItem, closeCart } = useCart();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<string | null>(null);
  const [trackOpen, setTrackOpen] = useState<string | null>(null);

  useEffect(() => {
    setOrders(readOrders());
  }, []);

  const downloadReceipt = (order: Order) => {
    const lines = [
      "VELORA — ORDER RECEIPT",
      "============================",
      `Order:      ${order.orderId}`,
      `Date:       ${formatOrderDate(order.date)}`,
      `Status:     ${STATUS_META[order.status].icon} ${order.status}`,
      `Customer:   ${order.name}`,
      `Email:      ${order.email}`,
      "",
      "Items:",
      ...order.items.map(
        (item) => `  • ${item.name} × ${item.qty} — $${item.price * item.qty}`
      ),
      "",
      `Subtotal:   $${order.total}`,
      "Shipping:   Free",
      `Total:      $${order.total}`,
      "",
      `Ship to:    ${order.shippingAddress}`,
      `Payment:    ${order.paymentMethod}`,
      "",
      "Thank you for shopping with Velora.",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${order.orderId}-receipt.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const buyAgain = (order: Order) => {
    order.items.forEach((item) => {
      for (let i = 0; i < item.qty; i += 1) {
        addItem(item.id, item.name, item.price);
      }
    });
    closeCart();
    router.push("/checkout");
  };

  if (orders === null) return <main className="orders-page" />;

  return (
    <main className="orders-page">
      <div className="orders-top">
        <Link href="/" className="orders-back-link">
          <i className="fas fa-arrow-left" /> Back to Shop
        </Link>
        <h1 className="orders-title">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="orders-empty">
          <i className="fas fa-box-open" />
          <h1>No Orders Yet</h1>
          <p>
            Your order history will appear here once you place your first
            order.
          </p>
          <Link href="/" className="btn">
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="orders-list">
            {orders.map((order) => (
              <div className="order-card" key={order.orderId}>
                <div className="order-card-header">
                  <div>
                    <h2>Order {order.orderId}</h2>
                    <p>{formatOrderDate(order.date)}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="order-card-items">
                  {order.items.map((item) => (
                    <div className="order-card-item" key={item.id}>
                      <span>• {item.name}</span>
                      <span>
                        ×{item.qty} — ${item.price * item.qty}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="order-card-total">
                  <span>Total</span>
                  <strong>${order.total}</strong>
                </div>

                {detailsOpen === order.orderId && (
                  <div className="order-details">
                    <div>
                      <span>Shipping Address</span>
                      <p>{order.shippingAddress}</p>
                    </div>
                    <div>
                      <span>Payment Method</span>
                      <p>{order.paymentMethod}</p>
                    </div>
                    <div>
                      <span>Customer</span>
                      <p>
                        {order.name} • {order.email}
                      </p>
                    </div>
                  </div>
                )}

                {trackOpen === order.orderId && (
                  <div className="order-track">
                    <OrderTimeline status={order.status} />
                  </div>
                )}

                <div className="order-card-actions">
                  <button
                    className="btn-outline order-action"
                    onClick={() =>
                      setDetailsOpen((prev) =>
                        prev === order.orderId ? null : order.orderId
                      )
                    }
                  >
                    <i className="fas fa-eye" /> View Details
                  </button>
                  <button
                    className="btn-outline order-action"
                    onClick={() =>
                      setTrackOpen((prev) =>
                        prev === order.orderId ? null : order.orderId
                      )
                    }
                  >
                    <i className="fas fa-truck-fast" /> Track Order
                  </button>
                  <button
                    className="btn-outline order-action"
                    onClick={() => downloadReceipt(order)}
                  >
                    <i className="fas fa-receipt" /> Download Receipt
                  </button>
                  <button
                    className="btn order-action"
                    onClick={() => buyAgain(order)}
                  >
                    <i className="fas fa-rotate-right" /> Buy Again
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="orders-back">
            <Link href="/" className="btn-outline">
              Continue Shopping
            </Link>
          </div>
        </>
      )}
    </main>
  );
}

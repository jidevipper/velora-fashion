"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PlacedOrder } from "@/app/checkout/CheckoutForm";
import "./orders.css";

export default function OrdersPage() {
  const [orders, setOrders] = useState<PlacedOrder[] | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("velora-orders");
      setOrders(stored ? (JSON.parse(stored) as PlacedOrder[]) : []);
    } catch {
      setOrders([]);
    }
  }, []);

  if (orders === null) return <main className="orders-page" />;

  if (orders.length === 0) {
    return (
      <main className="orders-page">
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
      </main>
    );
  }

  return (
    <main className="orders-page">
      <h1 className="orders-title">My Orders</h1>
      <div className="orders-list">
        {orders.map((order) => (
          <div className="order-card" key={order.number}>
            <div className="order-card-header">
              <div>
                <h2>{order.number}</h2>
                <p>{order.date}</p>
              </div>
              <span className="order-status">Confirmed</span>
            </div>
            <div className="order-card-items">
              {order.items.map((item) => (
                <div className="order-card-item" key={item.id}>
                  <span>{item.name}</span>
                  <span>
                    {item.qty} × ${item.price}
                  </span>
                </div>
              ))}
            </div>
            <div className="order-card-footer">
              <span>
                {order.name} • {order.city}, {order.country}
              </span>
              <strong>${order.total}</strong>
            </div>
          </div>
        ))}
      </div>
      <div className="orders-back">
        <Link href="/" className="btn-outline">
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}

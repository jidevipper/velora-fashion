"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/app/lib/supabase";
import {
  ORDER_STATUSES,
  STATUS_META,
  formatOrderDate,
  type OrderStatus,
} from "@/app/lib/orders";
import ProductsManager from "@/app/admin/ProductsManager";
import CollectionsManager from "@/app/admin/CollectionsManager";
import "./admin.css";

type AdminOrder = {
  id: string;
  orderId: string;
  name: string;
  email: string;
  date: string;
  total: number;
  itemCount: number;
  status: OrderStatus;
};

type AdminUser = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
};

type Tab = "dashboard" | "orders" | "products" | "collections" | "users";

function StatCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="admin-stat">
      <i className={`fas ${icon}`} />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [access, setAccess] = useState<"checking" | "allowed" | "denied">(
    "checking"
  );
  const [tab, setTab] = useState<Tab>("dashboard");
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setAccess("denied");
      return;
    }
    const check = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/admin/login");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      setAccess(data?.role === "admin" ? "allowed" : "denied");
    };
    void check();
  }, [router]);

  useEffect(() => {
    if (access !== "allowed") return;
    const supabase = getSupabase();
    if (!supabase) return;

    const load = async () => {
      const { data: orderRows } = await supabase
        .from("orders")
        .select("*")
        .order("date", { ascending: false });
      setOrders(
        (orderRows ?? []).map((row) => ({
          id: row.id,
          orderId: row.order_id,
          name: row.name,
          email: row.email,
          date: row.date,
          total: Number(row.total),
          itemCount: Array.isArray(row.items)
            ? (row.items as { qty?: number }[]).reduce(
                (sum, item) => sum + Number(item.qty ?? 0),
                0
              )
            : 0,
          status: row.status as OrderStatus,
        }))
      );

      const { data: userRows } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      setUsers((userRows ?? []) as AdminUser[]);
    };
    void load();
  }, [access]);

  const updateStatus = useCallback(
    async (id: string, status: OrderStatus) => {
      const supabase = getSupabase();
      if (!supabase) return;
      setSavingId(id);
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id);
      setSavingId(null);
      if (error) return;
      setOrders((prev) =>
        prev
          ? prev.map((order) => (order.id === id ? { ...order, status } : order))
          : prev
      );
    },
    []
  );

  const handleSignOut = useCallback(async () => {
    await getSupabase()?.auth.signOut();
    router.replace("/admin/login");
  }, [router]);

  const stats = useMemo(() => {
    const list = orders ?? [];
    const revenue = list
      .filter((order) => order.status !== "Cancelled")
      .reduce((sum, order) => sum + order.total, 0);
    const byStatus = ORDER_STATUSES.reduce<Record<string, number>>(
      (acc, status) => {
        acc[status] = list.filter((order) => order.status === status).length;
        return acc;
      },
      {}
    );
    const cancelled = list.filter((o) => o.status === "Cancelled").length;
    return {
      revenue,
      total: list.length,
      byStatus,
      cancelled,
    };
  }, [orders]);

  if (access === "checking") {
    return (
      <main className="admin-page">
        <p className="admin-loading">
          <i className="fas fa-spinner fa-spin" /> Checking access...
        </p>
      </main>
    );
  }

  if (access === "denied") {
    return (
      <main className="admin-page">
        <div className="admin-denied">
          <i className="fas fa-lock" />
          <h1>Access Denied</h1>
          <p>You do not have permission to view this page.</p>
          <div className="admin-denied-actions">
            <button
              className="btn btn-outline"
              onClick={() => void handleSignOut()}
            >
              <i className="fas fa-right-from-bracket" /> Sign Out
            </button>
            <Link href="/" className="btn">
              Back to Shop
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-top">
        <div>
          <h1 className="admin-title">Admin Panel</h1>
          <p className="admin-subtitle">VELORA — store management</p>
        </div>
        <div className="admin-top-actions">
          <button
            className="btn-outline"
            onClick={() => void handleSignOut()}
          >
            <i className="fas fa-right-from-bracket" /> Sign Out
          </button>
          <Link href="/" className="btn-outline">
            <i className="fas fa-arrow-left" /> Back to Shop
          </Link>
        </div>
      </div>

      <nav className="admin-tabs">
        <button
          className={`admin-tab${tab === "dashboard" ? " active" : ""}`}
          onClick={() => setTab("dashboard")}
        >
          <i className="fas fa-chart-line" /> Dashboard
        </button>
        <button
          className={`admin-tab${tab === "orders" ? " active" : ""}`}
          onClick={() => setTab("orders")}
        >
          <i className="fas fa-boxes" /> Orders
          {orders && <span className="admin-tab-count">{orders.length}</span>}
        </button>
        <button
          className={`admin-tab${tab === "products" ? " active" : ""}`}
          onClick={() => setTab("products")}
        >
          <i className="fas fa-shirt" /> Products
        </button>
        <button
          className={`admin-tab${tab === "collections" ? " active" : ""}`}
          onClick={() => setTab("collections")}
        >
          <i className="fas fa-layer-group" /> Collections
        </button>
        <button
          className={`admin-tab${tab === "users" ? " active" : ""}`}
          onClick={() => setTab("users")}
        >
          <i className="fas fa-users" /> Customers
          {users && <span className="admin-tab-count">{users.length}</span>}
        </button>
      </nav>

      {tab === "dashboard" && (
        <section className="admin-section">
          <div className="admin-stats">
            <StatCard
              icon="fa-dollar-sign"
              label="Total Revenue"
              value={`$${stats.revenue.toLocaleString()}`}
            />
            <StatCard
              icon="fa-boxes"
              label="Total Orders"
              value={String(stats.total)}
            />
            <StatCard
              icon="fa-truck"
              label="Shipped"
              value={String(stats.byStatus.Shipped ?? 0)}
            />
            <StatCard
              icon="fa-circle-check"
              label="Delivered"
              value={String(stats.byStatus.Delivered ?? 0)}
            />
            <StatCard
              icon="fa-clock"
              label="Processing"
              value={String(stats.byStatus.Processing ?? 0)}
            />
            <StatCard
              icon="fa-xmark"
              label="Cancelled"
              value={String(stats.cancelled)}
            />
          </div>

          <div className="admin-status-breakdown">
            <h2>Orders by Status</h2>
            {ORDER_STATUSES.map((status) => {
              const count = stats.byStatus[status] ?? 0;
              const pct = stats.total
                ? Math.round((count / stats.total) * 100)
                : 0;
              return (
                <div className="admin-status-row" key={status}>
                  <span>
                    {STATUS_META[status].icon} {status}
                  </span>
                  <div className="admin-status-bar">
                    <div
                      className={`admin-status-fill ${STATUS_META[status].className}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <strong>{count}</strong>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {tab === "orders" && (
        <section className="admin-section">
          {orders && orders.length > 0 ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="admin-order-id">{order.orderId}</td>
                      <td>
                        {order.name || "Guest"}
                        <span className="admin-cell-sub">{order.email}</span>
                      </td>
                      <td>{formatOrderDate(order.date)}</td>
                      <td>{order.itemCount}</td>
                      <td className="admin-order-total">${order.total}</td>
                      <td>
                        <select
                          className={`admin-status-select ${
                            STATUS_META[order.status].className
                          }`}
                          value={order.status}
                          disabled={savingId === order.id}
                          onChange={(event) =>
                            void updateStatus(
                              order.id,
                              event.target.value as OrderStatus
                            )
                          }
                        >
                          {([...ORDER_STATUSES, "Cancelled"] as OrderStatus[]).map(
                            (status) => (
                              <option key={status} value={status}>
                                {STATUS_META[status].icon} {status}
                              </option>
                            )
                          )}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-empty">
              <i className="fas fa-box-open" />
              <p>No orders yet. Orders placed on the store will appear here.</p>
            </div>
          )}
        </section>
      )}

      {tab === "products" && <ProductsManager />}

      {tab === "collections" && <CollectionsManager />}

      {tab === "users" && (
        <section className="admin-section">
          {users && users.length > 0 ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((profile) => (
                    <tr key={profile.id}>
                      <td>{profile.full_name || "—"}</td>
                      <td>{profile.email}</td>
                      <td>
                        <span
                          className={`admin-role admin-role-${profile.role}`}
                        >
                          {profile.role}
                        </span>
                      </td>
                      <td>
                        {new Date(profile.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-empty">
              <i className="fas fa-users" />
              <p>No customers yet.</p>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

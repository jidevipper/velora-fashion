"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";
import { useCatalog } from "@/app/context/CatalogContext";
import {
  generateOrderId,
  saveOrderToDb,
  type Order,
} from "@/app/lib/orders";
import "./checkout.css";

const initialForm = {
  email: "",
  name: "",
  address: "",
  city: "",
  postal: "",
  country: "",
  cardName: "",
  cardNumber: "",
  expiry: "",
  cvc: "",
};

export default function CheckoutForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { products } = useCatalog();
  const { items, total, clearCart } = useCart();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [placing, setPlacing] = useState(false);
  const [confirmation, setConfirmation] = useState<Order | null>(null);
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    if (!confirmation) return;
    const timer = window.setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [confirmation]);

  useEffect(() => {
    if (!confirmation || countdown > 0) return;
    router.push("/orders");
  }, [confirmation, countdown, router]);

  const set = (field: keyof typeof initialForm) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const formatCardNumber = (value: string) =>
    value
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, "$1 ");

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const formatCvc = (value: string) => value.replace(/\D/g, "").slice(0, 4);

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.push("Enter a valid email address.");
    if (!form.name.trim()) errs.push("Enter your full name.");
    if (!form.address.trim()) errs.push("Enter your street address.");
    if (!form.city.trim()) errs.push("Enter your city.");
    if (!form.postal.trim()) errs.push("Enter your postal code.");
    if (!form.country) errs.push("Select your country.");
    if (!form.cardName.trim()) errs.push("Enter the name on the card.");
    if (!/^\d{16}$/.test(form.cardNumber.replace(/\s/g, ""))) errs.push("Card number must be 16 digits.");
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiry)) errs.push("Expiry must be in MM/YY format.");
    if (!/^\d{3,4}$/.test(form.cvc)) errs.push("CVC must be 3 or 4 digits.");
    return errs;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (errs.length > 0) return;

    setPlacing(true);
    window.setTimeout(() => {
      const order: Order = {
        orderId: generateOrderId(),
        date: new Date().toISOString(),
        status: "Order Placed",
        items: items.map((item) => ({ ...item })),
        total,
        email: form.email,
        name: form.name,
        shippingAddress: [form.address, form.city, form.postal, form.country]
          .filter(Boolean)
          .join(", "),
        paymentMethod: `Card ending ${form.cardNumber
          .replace(/\s/g, "")
          .slice(-4)}`,
      };
      void saveOrderToDb(order, user?.id);
      clearCart();
      setPlacing(false);
      setConfirmation(order);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1400);
  };

  if (confirmation) {
    return (
      <main className="checkout-page">
        <div className="checkout-success">
          <i className="fas fa-circle-check" />
          <h1>Payment Successful!</h1>
          <p className="checkout-success-sub">
            Thank you for shopping with Velora.
          </p>
          <p className="checkout-order-number">
            Order Number: {confirmation.orderId}
          </p>
          <p className="checkout-success-track">Track your order below.</p>
          <div className="checkout-success-actions">
            <Link href="/orders" className="btn">
              Go to My Orders
            </Link>
            <Link href="/" className="btn-outline">
              Continue Shopping
            </Link>
          </div>
          <p className="checkout-success-countdown">
            Redirecting to My Orders in {countdown}s...
          </p>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <i className="fas fa-shopping-bag" />
          <h1>Your cart is empty</h1>
          <p>Add something to your cart before checking out.</p>
          <Link href="/" className="btn">
            Browse Collection
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <h1 className="checkout-title">Checkout</h1>

      <div className="checkout-grid">
        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          <section className="checkout-section">
            <h2>Contact</h2>
            <div className="input-box">
              <i className="fa-solid fa-envelope" />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={set("email")}
              />
            </div>
          </section>

          <section className="checkout-section">
            <h2>Shipping</h2>
            <div className="input-box">
              <i className="fa-solid fa-user" />
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={set("name")}
              />
            </div>
            <div className="input-box">
              <i className="fa-solid fa-location-dot" />
              <input
                type="text"
                placeholder="Street Address"
                value={form.address}
                onChange={set("address")}
              />
            </div>
            <div className="input-row">
              <div className="input-box">
                <input
                  type="text"
                  placeholder="City"
                  value={form.city}
                  onChange={set("city")}
                />
              </div>
              <div className="input-box">
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={form.postal}
                  onChange={set("postal")}
                />
              </div>
            </div>
            <div className="input-box">
              <i className="fa-solid fa-globe" />
              <select
                value={form.country}
                onChange={set("country")}
                className="checkout-select"
              >
                <option value="">Select Country</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Nigeria">Nigeria</option>
                <option value="France">France</option>
                <option value="Germany">Germany</option>
                <option value="Italy">Italy</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </section>

          <section className="checkout-section">
            <h2>Payment</h2>
            <div className="input-box">
              <i className="fa-regular fa-credit-card" />
              <input
                type="text"
                placeholder="Name on Card"
                value={form.cardName}
                onChange={set("cardName")}
              />
            </div>
            <div className="input-box">
              <i className="fa-solid fa-credit-card" />
              <input
                type="text"
                inputMode="numeric"
                placeholder="Card Number"
                value={form.cardNumber}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    cardNumber: formatCardNumber(e.target.value),
                  }))
                }
              />
            </div>
            <div className="input-row">
              <div className="input-box">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="MM/YY"
                  value={form.expiry}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      expiry: formatExpiry(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="input-box">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="CVC"
                  value={form.cvc}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      cvc: formatCvc(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
          </section>

          {errors.length > 0 && (
            <div className="checkout-errors">
              {errors.map((error) => (
                <p key={error}>
                  <i className="fa-solid fa-circle-exclamation" /> {error}
                </p>
              ))}
            </div>
          )}

          <button type="submit" className="btn checkout-submit" disabled={placing}>
            {placing ? (
              <>
                <i className="fas fa-spinner fa-spin" /> Processing...
              </>
            ) : (
              <>Place Order — ${total}</>
            )}
          </button>
        </form>

        <aside className="checkout-summary">
          <h2>Order Summary</h2>
          {items.map((item) => {
            const product = products.find((p) => p.id === item.id);
            return (
              <div className="checkout-summary-item" key={item.id}>
                {product && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.image} alt={item.name} />
                )}
                <div className="checkout-summary-info">
                  <h4>{item.name}</h4>
                  <p>
                    {item.qty} × ${item.price}
                  </p>
                </div>
                <span className="checkout-summary-price">
                  ${item.price * item.qty}
                </span>
              </div>
            );
          })}
          <div className="checkout-summary-totals">
            <div>
              <span>Subtotal</span>
              <span>${total}</span>
            </div>
            <div>
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="checkout-summary-grand">
              <span>Total</span>
              <span>${total}</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

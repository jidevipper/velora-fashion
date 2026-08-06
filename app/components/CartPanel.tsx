"use client";

import Link from "next/link";
import { useCart } from "@/app/context/CartContext";

export default function CartPanel() {
  const {
    items,
    total,
    isOpen,
    closeCart,
    increment,
    decrement,
    removeItem,
  } = useCart();

  return (
    <div className={`cart-panel${isOpen ? " active" : ""}`}>
      <div className="cart-header">
        <h2>Your Cart</h2>
        <button id="close-cart" onClick={closeCart} aria-label="Close cart">
          ✕
        </button>
      </div>

      <div id="cart-items">
        {items.length === 0 ? (
          <p className="cart-empty">Your cart is empty.</p>
        ) : (
          items.map((item) => (
            <div className="cart-item" key={item.id}>
              <div className="cart-item-info">
                <h4>{item.name}</h4>
                <p>${item.price}</p>
                <div className="cart-item-qty">
                  <button
                    onClick={() => decrement(item.id)}
                    aria-label={`Decrease quantity of ${item.name}`}
                  >
                    −
                  </button>
                  <span>{item.qty}</span>
                  <button
                    onClick={() => increment(item.id)}
                    aria-label={`Increase quantity of ${item.name}`}
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                className="cart-item-remove"
                onClick={() => removeItem(item.id)}
                aria-label={`Remove ${item.name}`}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      <div className="cart-footer">
        <h3>
          Total: <span id="cart-total">${total}</span>
        </h3>
        <Link href="/checkout" className="btn" onClick={closeCart}>
          Checkout
        </Link>
      </div>
    </div>
  );
}

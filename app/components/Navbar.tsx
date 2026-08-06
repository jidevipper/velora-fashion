"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";
import logo from "@/public/images/logo.png";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, openCart } = useCart();
  const { user, loading, signOut } = useAuth();

  const scrollToSearch = () => {
    document.getElementById("search")?.scrollIntoView({ behavior: "smooth" });
    document.getElementById("search-input")?.focus();
  };

  return (
    <header>
      <nav className="navbar">
        <div className="logo">
          <Image src={logo} alt="Velora Logo" />
          <h2>VELORA</h2>
        </div>

        <ul className={`nav-links${menuOpen ? " active" : ""}`}>
          <li>
            <a href="#home" onClick={() => setMenuOpen(false)}>
              Home
            </a>
          </li>
          <li>
            <a href="#about" onClick={() => setMenuOpen(false)}>
              About
            </a>
          </li>
          <li>
            <a href="#collection" onClick={() => setMenuOpen(false)}>
              Collection
            </a>
          </li>
          <li>
            <a href="#reviews" onClick={() => setMenuOpen(false)}>
              Reviews
            </a>
          </li>
          <li>
            <a href="#contact" onClick={() => setMenuOpen(false)}>
              Contact
            </a>
          </li>
        </ul>

        <div className="nav-icons">
          {loading ? null : user ? (
            <>
              <Link href="/account" className="nav-account" title={user.email}>
                <i className="fas fa-user-circle" />
                <span>{user.name.split(" ")[0]}</span>
              </Link>
              <button
                className="nav-signout"
                onClick={signOut}
                title="Sign out"
                aria-label="Sign out"
              >
                <i className="fas fa-sign-out-alt" />
              </button>
            </>
          ) : (
            <Link href="/login" className="nav-signin">
              Sign In
            </Link>
          )}
          <div className="search-icon" onClick={scrollToSearch}>
            <i className="fas fa-search" />
          </div>
          <div className="cart-icon" onClick={openCart}>
            <i className="fas fa-shopping-bag" />
            <span id="cart-count">{count}</span>
          </div>
          <div
            className="menu-btn"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <i className="fas fa-bars" />
          </div>
        </div>
      </nav>
    </header>
  );
}

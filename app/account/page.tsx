"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import "./account.css";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const handleSignOut = () => {
    void signOut();
    router.push("/login");
  };

  return (
    <main className="account-page">
      {loading ? null : user ? (
        <div className="account-layout">
          <nav className="account-menu">
            <Link href="/account" className="account-menu-link active">
              My Account
            </Link>
            <Link href="/orders" className="account-menu-link">
              My Orders
            </Link>
            <Link href="/wishlist" className="account-menu-link">
              Wishlist
            </Link>
            <Link href="/addresses" className="account-menu-link">
              Addresses
            </Link>
            <Link href="/payment-methods" className="account-menu-link">
              Payment Methods
            </Link>
            <Link href="/settings" className="account-menu-link">
              Settings
            </Link>
            <button className="account-menu-link logout" onClick={handleSignOut}>
              <i className="fas fa-sign-out-alt" /> Logout
            </button>
          </nav>

          <div className="account-card">
          <div className="account-avatar">
            {user.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.picture} alt={user.name} />
            ) : (
              <i className="fas fa-user-circle" />
            )}
          </div>
          <h1>{user.name}</h1>
          <p className="account-email">{user.email}</p>

          <div className="account-details">
            <div>
              <span>Provider</span>
              <strong className={`provider-${user.provider}`}>
                {user.provider === "google" ? "Google Account" : "Email & Password"}
              </strong>
            </div>
            <div>
              <span>Member since</span>
              <strong>
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </strong>
            </div>
          </div>

          <div className="account-actions">
            <Link href="/orders" className="btn">
              My Orders
            </Link>
            <Link href="/" className="btn-outline">
              Continue Shopping
            </Link>
          </div>
        </div>
        </div>
      ) : (
        <div className="account-card">
          <div className="account-avatar">
            <i className="fas fa-user-circle" />
          </div>
          <h1>Not Signed In</h1>
          <p className="account-email">
            Sign in to view your profile, orders and wishlist.
          </p>
          <div className="account-actions">
            <Link href="/login" className="btn">
              Sign In
            </Link>
            <Link href="/" className="btn-outline">
              Back to Home
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

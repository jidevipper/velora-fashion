"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import "./account.css";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    router.push("/login");
  };

  return (
    <main className="account-page">
      {loading ? null : user ? (
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
            <button className="btn btn-ghost" onClick={handleSignOut}>
              Sign Out
            </button>
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

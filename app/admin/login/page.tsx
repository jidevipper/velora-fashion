"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/app/lib/supabase";
import "@/app/login/auth.css";
import "../login.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setChecking(false);
      return;
    }
    let active = true;
    const check = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (active) setChecking(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (!active) return;
      if (profile?.role === "admin") {
        router.replace("/admin");
      } else {
        await supabase.auth.signOut();
        setChecking(false);
      }
    };
    void check();
    return () => {
      active = false;
    };
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    const supabase = getSupabase();
    if (!supabase) {
      setError("Admin sign-in is not configured.");
      setSubmitting(false);
      return;
    }

    const { data: auth, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: cleanEmail.toLowerCase(),
        password,
      });
    if (signInError) {
      setError("Invalid email or password.");
      setSubmitting(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", auth.user.id)
      .maybeSingle();

    if (profile?.role === "admin") {
      router.replace("/admin");
      return;
    }

    await supabase.auth.signOut();
    setError("That account does not have admin access.");
    setSubmitting(false);
  };

  if (checking) {
    return (
      <main className="login-page admin-login">
        <div className="login-card">
          <p className="admin-login-loading">
            <i className="fas fa-spinner fa-spin" /> Checking...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="login-page admin-login">
      <div className="login-card">
        <span className="admin-login-badge">
          <i className="fas fa-shield-halved" /> Admin
        </span>
        <h1>VELORA</h1>
        <p className="admin-login-note">
          Sign in with your administrator account to manage the store.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-box">
            <i className="fa-solid fa-envelope" />
            <input
              type="email"
              placeholder="Admin email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="input-box">
            <i className="fa-solid fa-lock" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label="Toggle password visibility"
            >
              <i
                className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
              />
            </button>
          </div>

          {error && (
            <p className="auth-error">
              <i className="fa-solid fa-circle-exclamation" /> {error}
            </p>
          )}

          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? (
              <>
                <i className="fas fa-spinner fa-spin" /> Verifying...
              </>
            ) : (
              "Sign In to Admin"
            )}
          </button>
        </form>

        <Link href="/" className="admin-login-shop">
          <i className="fas fa-arrow-left" /> Back to Shop
        </Link>

        <p className="admin-login-secure">
          <i className="fas fa-lock" /> Protected by Supabase Auth
        </p>
      </div>
    </main>
  );
}

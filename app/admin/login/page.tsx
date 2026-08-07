"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/app/lib/supabase";
import "@/app/login/auth.css";
import "../login.css";

function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

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

  const handleGoogleSignIn = async () => {
    setError(null);
    setSubmitting(true);
    const supabase = getSupabase();
    if (!supabase) {
      setError("Admin sign-in is not configured.");
      setSubmitting(false);
      return;
    }
    const redirectTo = `${window.location.origin}/admin`;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (oauthError) {
      setError(oauthError.message);
      setSubmitting(false);
    }
  };

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
          <div className="google-login">
            <button
              type="button"
              className="google-button"
              onClick={() => void handleGoogleSignIn()}
              disabled={submitting}
            >
              <GoogleG />
              {submitting ? "Connecting to Google..." : "Continue with Google"}
            </button>
            <div className="divider">
              <span>or sign in with email</span>
            </div>
          </div>

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

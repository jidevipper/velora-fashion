"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import "./auth.css";

type Mode = "signin" | "signup";

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

export default function LoginForm() {
  const router = useRouter();
  const { user, loading, signIn, signUp, signInWithGoogle, signOut } = useAuth();

  const [mode, setMode] = useState<Mode>("signin");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (field: keyof typeof form) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const switchMode = (next: Mode) => {
    setMode(next);
    setAuthError(null);
  };

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    setAuthError(null);
    const error = await signInWithGoogle();
    if (error) {
      setAuthError(error);
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);

    const email = form.email.trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setAuthError("Enter a valid email address.");
      return;
    }
    if (form.password.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    if (mode === "signup") {
      if (!form.name.trim()) {
        setAuthError("Enter your full name.");
        setSubmitting(false);
        return;
      }
      if (form.password !== form.confirm) {
        setAuthError("Passwords do not match.");
        setSubmitting(false);
        return;
      }
      const error = await signUp(form.name, form.email, form.password);
      if (error) setAuthError(error);
      else router.push("/");
    } else {
      const error = await signIn(form.email, form.password);
      if (error) setAuthError(error);
      else router.push("/");
    }
    setSubmitting(false);
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <h1>VELORA</h1>
        <p>{mode === "signin" ? "Welcome Back" : "Join Velora"}</p>

        {loading ? null : user ? (
          <>
            <p className="login-greeting">
              You&apos;re signed in as {user.name}.
            </p>
            <div className="login-actions">
              <button className="btn" onClick={() => router.push("/")}>
                Continue Shopping
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  void signOut();
                  setMode("signin");
                }}
              >
                Sign Out
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="auth-tabs">
              <button
                className={`auth-tab${mode === "signin" ? " active" : ""}`}
                onClick={() => switchMode("signin")}
              >
                Sign In
              </button>
              <button
                className={`auth-tab${mode === "signup" ? " active" : ""}`}
                onClick={() => switchMode("signup")}
              >
                Create Account
              </button>
            </div>

            <div className="google-login">
              <button
                type="button"
                className="google-button"
                onClick={handleGoogleSignIn}
                disabled={submitting}
              >
                <GoogleG />
                {submitting ? "Connecting to Google..." : "Continue with Google"}
              </button>
              <div className="divider">
                <span>or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {mode === "signup" && (
                <div className="input-box">
                  <i className="fa-solid fa-user" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={set("name")}
                  />
                </div>
              )}

              <div className="input-box">
                <i className="fa-solid fa-envelope" />
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={set("email")}
                />
              </div>

              <div className="input-box">
                <i className="fa-solid fa-lock" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={form.password}
                  onChange={set("password")}
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

              {mode === "signup" && (
                <div className="input-box">
                  <i className="fa-solid fa-lock" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={form.confirm}
                    onChange={set("confirm")}
                  />
                </div>
              )}

              {authError && (
                <p className="auth-error">
                  <i className="fa-solid fa-circle-exclamation" /> {authError}
                </p>
              )}

              <button
                type="submit"
                className="btn"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin" /> Please wait...
                  </>
                ) : mode === "signin" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {mode === "signin" && <a href="#">Forgot Password?</a>}

            <p className="auth-switch">
              {mode === "signin" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button onClick={() => switchMode("signup")}>Create one</button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button onClick={() => switchMode("signin")}>Sign in</button>
                </>
              )}
            </p>
          </>
        )}
      </div>
    </main>
  );
}

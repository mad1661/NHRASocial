"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import { getFirebaseClientAuth, hasFirebaseClientConfig } from "@/lib/firebase/client";

interface AuthFormProps {
  serverReady: boolean;
}

export function AuthForm({ serverReady }: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check client-side Firebase readiness here so the server
  // never influences this value — avoids hydration mismatches.
  const firebaseReady = hasFirebaseClientConfig();
  const ready = firebaseReady && serverReady;

  function switchMode(next: "login" | "signup") {
    if (next === mode) return;
    setMode(next);
    setError("");
  }

  async function createServerSession(idToken: string, displayName?: string) {
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, displayName }),
    });
    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      throw new Error(payload.error ?? "Could not create the app session.");
    }
  }

  async function onSubmit() {
    if (!ready) return;
    setError("");
    setIsSubmitting(true);

    try {
      const auth = getFirebaseClientAuth();
      const credential =
        mode === "login"
          ? await signInWithEmailAndPassword(auth, email, password)
          : await createUserWithEmailAndPassword(auth, email, password);

      if (mode === "signup" && name.trim().length > 0) {
        await updateProfile(credential.user, { displayName: name.trim() });
      }

      const idToken = await credential.user.getIdToken(true);
      await createServerSession(idToken, credential.user.displayName ?? name.trim());
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-tabs-wrapper">
      {/* Tab switcher */}
      <div className="auth-tabs" role="tablist">
        <button
          className={`auth-tab${mode === "login" ? " auth-tab--active" : ""}`}
          role="tab"
          aria-selected={mode === "login"}
          type="button"
          onClick={() => switchMode("login")}
        >
          Sign in
        </button>
        <button
          className={`auth-tab${mode === "signup" ? " auth-tab--active" : ""}`}
          role="tab"
          aria-selected={mode === "signup"}
          type="button"
          onClick={() => switchMode("signup")}
        >
          Create account
        </button>
      </div>

      {/* Form */}
      <div className="auth-form-body">
        {mode === "signup" && (
          <label className="auth-field">
            <span className="auth-label">Name</span>
            <input
              className="auth-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              disabled={isSubmitting}
            />
          </label>
        )}

        <label className="auth-field">
          <span className="auth-label">Email</span>
          <input
            className="auth-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@nhra.com"
            autoComplete="email"
            disabled={isSubmitting}
          />
        </label>

        <label className="auth-field">
          <span className="auth-label">Password</span>
          <input
            className="auth-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            disabled={isSubmitting}
            onKeyDown={(e) => {
              if (e.key === "Enter") void onSubmit();
            }}
          />
        </label>

        {!ready && !error && (
          <p className="auth-error" style={{ borderColor: "rgba(255,179,71,0.3)", background: "rgba(255,179,71,0.08)", color: "var(--warning)" }}>
            {!firebaseReady ? "Firebase client config not found in bundle." : "Firebase Admin config missing on server."}
          </p>
        )}

        {error && <p className="auth-error">{error}</p>}

        <button
          className="auth-submit"
          type="button"
          disabled={isSubmitting || !ready}
          onClick={() => void onSubmit()}
        >
          {isSubmitting
            ? mode === "login" ? "Signing in…" : "Creating account…"
            : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </div>
    </div>
  );
}

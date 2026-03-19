"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import { getFirebaseClientAuth } from "@/lib/firebase/client";

interface AuthFormProps {
  firebaseReady: boolean;
  serverReady: boolean;
}

export function AuthForm({ firebaseReady, serverReady }: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ready = firebaseReady && serverReady;

  function toggleMode() {
    setMode((current) => (current === "login" ? "signup" : "login"));
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
    <section className="panel" style={{ marginTop: 8 }}>
      <div className="stack">
        {mode === "signup" && (
          <label className="settings-field">
            <span className="metric-label">Name</span>
            <input
              className="settings-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </label>
        )}

        <label className="settings-field">
          <span className="metric-label">Email</span>
          <input
            className="settings-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@nhra.com"
            autoComplete="email"
          />
        </label>

        <label className="settings-field">
          <span className="metric-label">Password</span>
          <input
            className="settings-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            onKeyDown={(e) => {
              if (e.key === "Enter") void onSubmit();
            }}
          />
        </label>

        {error && (
          <p style={{ margin: 0, color: "var(--danger)", fontSize: "0.9rem" }}>
            {error}
          </p>
        )}

        <button
          className="button"
          type="button"
          disabled={isSubmitting || !ready}
          onClick={() => void onSubmit()}
          style={{ width: "100%", textAlign: "center" }}
        >
          {isSubmitting
            ? mode === "login" ? "Signing in…" : "Creating account…"
            : mode === "login" ? "Sign in" : "Create account"}
        </button>

        <button
          className="button-secondary"
          type="button"
          disabled={isSubmitting}
          onClick={toggleMode}
          style={{ width: "100%", textAlign: "center", cursor: "pointer" }}
        >
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </section>
  );
}

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
  const [status, setStatus] = useState(
    firebaseReady && serverReady
      ? "Sign in to access your own connector workspace."
      : !firebaseReady
        ? "Firebase client configuration is missing."
        : "Firebase admin configuration is missing.",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function createServerSession(idToken: string, displayName?: string) {
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken, displayName }),
    });

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      throw new Error(payload.error ?? "Could not create the app session.");
    }
  }

  async function onSubmit() {
    if (!firebaseReady || !serverReady) {
      return;
    }

    setIsSubmitting(true);
    setStatus(mode === "login" ? "Signing in..." : "Creating account...");

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
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Authentication failed.",
      );
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
  }

  return (
    <section className="panel auth-panel">
      {!(firebaseReady && serverReady) ? null : (
        <p className="small" style={{ margin: "0 0 18px", color: "var(--muted)" }}>
          {status}
        </p>
      )}

      <div className="stack auth-form">
        {mode === "signup" ? (
          <label className="settings-field">
            <span className="metric-label">Name</span>
            <input
              className="settings-input"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Team member name"
            />
          </label>
        ) : null}

        <label className="settings-field">
          <span className="metric-label">Email</span>
          <input
            className="settings-input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@nhra.com"
          />
        </label>

        <label className="settings-field">
          <span className="metric-label">Password</span>
          <input
            className="settings-input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimum 6 characters"
          />
        </label>

        <div className="hero-actions">
          <button
            className="button"
            type="button"
            disabled={isSubmitting || !firebaseReady || !serverReady}
            onClick={() => {
              void onSubmit();
            }}
          >
            {isSubmitting
              ? mode === "login"
                ? "Signing in..."
                : "Creating account..."
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </button>

          <button
            className="button-secondary"
            type="button"
            disabled={isSubmitting}
            onClick={() =>
              setMode((current) =>
                current === "login" ? "signup" : "login",
              )
            }
          >
            {mode === "login"
              ? "Need an account?"
              : "Already have an account?"}
          </button>
        </div>
      </div>
    </section>
  );
}

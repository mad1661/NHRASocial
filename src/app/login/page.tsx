import { redirect } from "next/navigation";

import { AuthForm } from "@/components/AuthForm";
import { getCurrentUserContext } from "@/lib/auth/session";
import { hasFirebaseAdminConfig, hasFirebaseClientConfig } from "@/lib/env";

export default async function LoginPage() {
  const currentUser = await getCurrentUserContext();
  const firebaseClientReady = hasFirebaseClientConfig();
  const firebaseAdminReady = hasFirebaseAdminConfig();

  if (currentUser) {
    redirect("/dashboard");
  }

  const ready = firebaseClientReady && firebaseAdminReady;

  return (
    <main className="shell">
      <div className="page" style={{ maxWidth: 480, margin: "0 auto" }}>
        <section className="hero">
          <span className="eyebrow">NHRA Content Intelligence</span>
          <h1 style={{ fontSize: "clamp(2rem,5vw,3rem)", marginTop: 16, marginBottom: 8 }}>
            Sign in
          </h1>
          <p className="copy" style={{ marginBottom: 28 }}>
            Access your race-week content dashboard and connector workspace.
          </p>

          {!ready && (
            <div className="list-item" style={{ marginBottom: 20, borderColor: "rgba(255,111,60,0.35)" }}>
              <p style={{ margin: 0, color: "var(--warning)", fontSize: "0.9rem" }}>
                {!firebaseClientReady && "Firebase client config not found. "}
                {!firebaseAdminReady && "Firebase Admin config not found. "}
                Check environment variables.
              </p>
            </div>
          )}

          <AuthForm firebaseReady={firebaseClientReady} serverReady={firebaseAdminReady} />
        </section>
      </div>
    </main>
  );
}

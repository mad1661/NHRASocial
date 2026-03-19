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

  return (
    <main className="shell">
      <div className="page">
        <section className="hero">
          <span className="eyebrow">Multi-user auth</span>
          <div className="hero-grid">
            <div>
              <h1>Give every NHRA operator their own connector workspace.</h1>
              <p>
                Sign in with Firebase email/password auth. Each user gets a
                personal workspace and private connector settings stored in
                Firestore.
              </p>
              <div className="list auth-notes">
                <article className="list-item">
                  <h3>Firebase web app</h3>
                  <p>
                    The public Firebase web config is already loaded into
                    `.env.local`.
                  </p>
                </article>
                <article className="list-item">
                  <h3>Still needed</h3>
                  <p>
                    Add `FIREBASE_ADMIN_PROJECT_ID`,
                    `FIREBASE_ADMIN_CLIENT_EMAIL`, and
                    `FIREBASE_ADMIN_PRIVATE_KEY` to `.env.local`, then enable
                    Email/Password auth in Firebase.
                  </p>
                </article>
                <article className="list-item">
                  <h3>Status</h3>
                  <p>
                    Client config: {firebaseClientReady ? "ready" : "missing"}.
                    Admin config: {firebaseAdminReady ? "ready" : "missing"}.
                  </p>
                </article>
              </div>
            </div>
            <AuthForm
              firebaseReady={firebaseClientReady}
              serverReady={firebaseAdminReady}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

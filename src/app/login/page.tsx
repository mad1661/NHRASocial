import { redirect } from "next/navigation";

import { AuthForm } from "@/components/AuthForm";
import { getCurrentUserContext } from "@/lib/auth/session";
import { hasFirebaseAdminConfig } from "@/lib/env";
import { hasFirebaseClientConfig } from "@/lib/firebase/client";

export default async function LoginPage() {
  const currentUser = await getCurrentUserContext();

  if (currentUser) {
    redirect("/dashboard");
  }

  const firebaseClientReady = hasFirebaseClientConfig();
  const firebaseAdminReady = hasFirebaseAdminConfig();

  return (
    <main className="login-shell">
      <div className="login-card">
        <div className="login-brand">
          <span className="eyebrow">NHRA Content Intelligence</span>
          <h1 className="login-title">Welcome back</h1>
          <p className="login-sub">Sign in to your dashboard and connector workspace.</p>
        </div>

        {(!firebaseClientReady || !firebaseAdminReady) && (
          <div className="login-warning">
            {!firebaseClientReady && <span>Firebase client config missing. </span>}
            {!firebaseAdminReady && <span>Firebase Admin config missing. </span>}
            <span>Check environment variables.</span>
          </div>
        )}

        <AuthForm firebaseReady={firebaseClientReady} serverReady={firebaseAdminReady} />
      </div>
    </main>
  );
}

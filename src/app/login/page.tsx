import { redirect } from "next/navigation";

import { AuthForm } from "@/components/AuthForm";
import { getCurrentUserContext } from "@/lib/auth/session";
import { hasFirebaseAdminConfig } from "@/lib/env";

export default async function LoginPage() {
  const currentUser = await getCurrentUserContext();

  if (currentUser) {
    redirect("/dashboard");
  }

  const serverReady = hasFirebaseAdminConfig();

  return (
    <main className="login-shell">
      <div className="login-card">
        <div className="login-brand">
          <span className="eyebrow">NHRA Content Intelligence</span>
          <h1 className="login-title">Welcome back</h1>
          <p className="login-sub">Sign in to your dashboard and connector workspace.</p>
        </div>

        <AuthForm serverReady={serverReady} />
      </div>
    </main>
  );
}

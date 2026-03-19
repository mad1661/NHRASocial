"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

import { getFirebaseClientAuth } from "@/lib/firebase/client";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    try {
      await signOut(getFirebaseClientAuth());
    } catch {
      // Ignore client logout failures and clear the server session anyway.
    }

    await fetch("/api/auth/session", {
      method: "DELETE",
    });

    router.push("/login");
    router.refresh();
  }

  return (
    <button
      className="button-secondary"
      type="button"
      onClick={() => {
        void logout();
      }}
    >
      Sign out
    </button>
  );
}

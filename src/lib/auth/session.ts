import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  getUserWorkspaceContext,
  type ProvisionedUserContext,
} from "@/lib/auth/provision";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";

export const sessionCookieName = "nhra_session";
const sessionDurationMs = 1000 * 60 * 60 * 24 * 5;

export async function createSessionCookie(idToken: string) {
  const auth = getFirebaseAdminAuth();
  return auth.createSessionCookie(idToken, {
    expiresIn: sessionDurationMs,
  });
}

export async function verifySessionCookie(sessionCookie: string) {
  const auth = getFirebaseAdminAuth();
  return auth.verifySessionCookie(sessionCookie, true);
}

export async function getCurrentUserContext(): Promise<ProvisionedUserContext | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(sessionCookieName)?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const decoded = await verifySessionCookie(sessionCookie);
    return getUserWorkspaceContext(decoded.uid);
  } catch {
    return null;
  }
}

export async function requireUserContext() {
  const currentUser = await getCurrentUserContext();

  if (!currentUser) {
    redirect("/login");
  }

  return currentUser;
}

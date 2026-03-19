import { NextResponse } from "next/server";

import { provisionUserWorkspace } from "@/lib/auth/provision";
import {
  createSessionCookie,
  getCurrentUserContext,
  sessionCookieName,
} from "@/lib/auth/session";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";

const sessionDurationSeconds = 60 * 60 * 24 * 5;

export async function GET() {
  const user = await getCurrentUserContext();

  return NextResponse.json({ user });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    idToken?: string;
    displayName?: string;
  };

  if (!payload.idToken) {
    return NextResponse.json({ error: "Missing idToken." }, { status: 400 });
  }

  try {
    const auth = getFirebaseAdminAuth();
    const decoded = await auth.verifyIdToken(payload.idToken);
    const user = await provisionUserWorkspace({
      uid: decoded.uid,
      email: decoded.email,
      displayName:
        typeof payload.displayName === "string" && payload.displayName.trim().length > 0
          ? payload.displayName.trim()
          : decoded.name,
    });
    const sessionCookie = await createSessionCookie(payload.idToken);
    const response = NextResponse.json({ ok: true, user });

    response.cookies.set({
      name: sessionCookieName,
      value: sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: sessionDurationSeconds,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not create a Firebase session.",
      },
      { status: 401 },
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: sessionCookieName,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

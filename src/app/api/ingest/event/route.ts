import { NextResponse } from "next/server";

import { getCurrentUserContext } from "@/lib/auth/session";
import { getNhraEvent } from "@/lib/connectors/event-feed";

export async function GET() {
  const currentUser = await getCurrentUserContext();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const eventResult = await getNhraEvent(currentUser);

  return NextResponse.json({
    source: eventResult.connector,
    event: eventResult.event,
  });
}

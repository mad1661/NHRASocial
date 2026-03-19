import { NextResponse } from "next/server";

import type { ConnectorSettingsValues } from "@/lib/connector-settings";
import { getCurrentUserContext } from "@/lib/auth/session";
import { getNhraEvent } from "@/lib/connectors/event-feed";
import { getMetaOwnedPosts } from "@/lib/connectors/meta";
import { getYouTubeOwnedPosts } from "@/lib/connectors/youtube";

type ConnectorTestTarget = "meta" | "youtube" | "event";

interface TestPayload {
  connector?: ConnectorTestTarget;
  values?: Partial<ConnectorSettingsValues>;
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUserContext();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = (await request.json()) as TestPayload;
  const overrides = payload.values ?? {};

  if (payload.connector === "meta") {
    const result = await getMetaOwnedPosts(currentUser, overrides);

    return NextResponse.json({
      connector: result.connector,
      summary: `Received ${result.posts.length} Meta posts.`,
    });
  }

  if (payload.connector === "youtube") {
    const result = await getYouTubeOwnedPosts(currentUser, overrides);

    return NextResponse.json({
      connector: result.connector,
      summary: `Received ${result.posts.length} YouTube posts.`,
    });
  }

  if (payload.connector === "event") {
    const result = await getNhraEvent(currentUser, overrides);

    return NextResponse.json({
      connector: result.connector,
      summary: `Loaded event ${result.event.name}.`,
    });
  }

  return NextResponse.json(
    { error: "Choose meta, youtube, or event." },
    { status: 400 },
  );
}

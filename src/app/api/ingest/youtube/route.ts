import { NextResponse } from "next/server";

import { getCurrentUserContext } from "@/lib/auth/session";
import { getYouTubeOwnedPosts } from "@/lib/connectors/youtube";

export async function GET() {
  const currentUser = await getCurrentUserContext();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const youtubeResult = await getYouTubeOwnedPosts(currentUser);

  return NextResponse.json({
    source: youtubeResult.connector,
    postCount: youtubeResult.posts.length,
    latestPosts: youtubeResult.posts,
  });
}
